const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env.local keys
const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const connectionString = "postgresql://postgres.zfljbcdachfjaarbsume:ecL8AeJibWpYuvOV@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const email = "Rayees@gmail.com";
  const password = "Test@12345";
  const fullName = "Rayees";
  const role = "admin";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  console.log(`Step 1: Signing up user ${email} via Supabase Auth API...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  });

  if (error) {
    console.error("Auth API signUp failed:", error.message);
  } else {
    console.log("✓ Sign up initiated successfully.");
  }

  // Step 2: Connect to PostgreSQL and confirm user + update role
  console.log("\nStep 2: Connecting to PostgreSQL to confirm email and set admin role...");
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // Update auth.users to confirm email and confirm user
    const updateAuthQuery = `
      UPDATE auth.users 
      SET 
        email_confirmed_at = NOW(), 
        last_sign_in_at = NOW(),
        raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "full_name": "Rayees"}'::jsonb
      WHERE email = $1
      RETURNING id;
    `;
    const res = await client.query(updateAuthQuery, [email]);

    if (res.rows.length === 0) {
      console.error("✗ Failed to locate user in auth.users database table. Make sure the email signed up successfully.");
    } else {
      const userId = res.rows[0].id;
      console.log(`✓ Confirmed user in auth.users (ID: ${userId})`);

      // Ensure profile row exists in public.profiles with role = 'admin'
      const checkProfileQuery = `SELECT id FROM public.profiles WHERE id = $1`;
      const profileRes = await client.query(checkProfileQuery, [userId]);

      if (profileRes.rows.length === 0) {
        console.log("Profile not found, inserting profile row...");
        const insertProfileQuery = `
          INSERT INTO public.profiles (id, full_name, role)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO UPDATE SET role = $3, full_name = $2;
        `;
        await client.query(insertProfileQuery, [userId, fullName, role]);
      } else {
        console.log("Profile found, updating profile role to admin...");
        const updateProfileQuery = `
          UPDATE public.profiles
          SET role = $2, full_name = $3
          WHERE id = $1;
        `;
        await client.query(updateProfileQuery, [userId, role, fullName]);
      }
      console.log("✓ Public profile successfully synced as admin!");
    }

  } catch (dbErr) {
    console.error("✗ Database query error:", dbErr.message);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
