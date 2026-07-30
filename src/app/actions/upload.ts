"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit-logger";
import { revalidatePath } from "next/cache";

async function ensureResumeBucket(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const existingBucket = buckets?.find((b) => b.name === "resumes");

    if (!existingBucket) {
      // Create bucket — default is NOT public, so we must be explicit
      const { error } = await supabaseAdmin.storage.createBucket("resumes", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/rtf",
        ],
      });
      if (error) {
        console.error("Failed to create resumes bucket:", error);
        return false;
      }
    } else if (!existingBucket.public) {
      // Bucket exists but is not public — update it
      const { error } = await supabaseAdmin.storage.updateBucket("resumes", {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/rtf",
        ],
      });
      if (error) {
        console.error("Failed to update resumes bucket to public:", error);
        // Continue anyway — we'll fall back to signed URLs
      }
    }

    return true;
  } catch (err) {
    console.error("Error ensuring resumes bucket:", err);
    return false;
  }
}

export async function uploadResume(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("resume") as File | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error:
          "Invalid file type. Please upload a PDF, DOC, DOCX, TXT, or RTF file.",
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Maximum size is 10MB.",
      };
    }

    // Ensure bucket exists and is public
    const bucketReady = await ensureResumeBucket();
    if (!bucketReady) {
      return {
        success: false,
        error: "Failed to initialize storage. Please try again or contact support.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `uploads/${timestamp}-${random}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Try to get a signed URL (valid for 10 years) — this works even if bucket is not public
    // because supabaseAdmin uses service_role key which bypasses RLS
    const signedUrlResult = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10); // 10 years

    if (signedUrlResult.error) {
      // Fall back to public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("resumes")
        .getPublicUrl(data.path);
      return { success: true, url: publicUrlData.publicUrl };
    }

    return { success: true, url: signedUrlResult.data.signedUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Upload failed" };
  }
}

export async function uploadContactFile(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    const contactId = formData.get("contactId") as string;
    const profile = await requireAuth();

    if (!file) return { success: false, error: "No file provided" };
    
    // Ensure bucket exists
    const bucketName = "contact-files";
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === bucketName);
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${contactId}/${timestamp}-${random}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) return { success: false, error: error.message };

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    // Save as activity of type "file"
    await supabaseAdmin.from("activities").insert({
      type: "file",
      content: `Uploaded file: ${file.name}`,
      contact_id: contactId,
      created_by: profile.id,
      metadata: {
        filename: file.name,
        size: file.size,
        url: publicUrlData.publicUrl
      }
    });

    await logAuditAction("File Uploaded", { contact_id: contactId, filename: file.name });

    revalidatePath(`/crm/contacts/${contactId}`);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}