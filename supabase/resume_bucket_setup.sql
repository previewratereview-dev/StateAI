-- ─── Resume Uploads Storage Bucket Setup ─────────────────────────────────────
-- Run this in the Supabase SQL Editor

-- Create a bucket for resumes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB limit
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
)
on conflict (id) do nothing;

-- Allow public (anonymous) users to upload to the resumes bucket
drop policy if exists "Anyone can upload resumes" on storage.objects;
create policy "Anyone can upload resumes"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'uploads');

-- Allow anyone to view/download resumes
drop policy if exists "Anyone can view resumes" on storage.objects;
create policy "Anyone can view resumes"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'resumes');

-- Allow authenticated users to delete resumes
drop policy if exists "Authenticated users can delete resumes" on storage.objects;
create policy "Authenticated users can delete resumes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'resumes');