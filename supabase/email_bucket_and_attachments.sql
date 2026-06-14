-- ─── Email Attachments Setup ─────────────────────────────────────
-- Run this in the Supabase SQL Editor

-- 1. Add the attachments column to the emails table
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Create a bucket for email attachments
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'email-attachments',
  'email-attachments',
  true, -- Publicly accessible so we can link them directly
  41943040 -- 40MB limit for email attachments
)
on conflict (id) do update set public = true;

-- 3. Allow service role (server) to manage objects
drop policy if exists "Service role can manage email attachments" on storage.objects;
create policy "Service role can manage email attachments"
  on storage.objects for all
  to service_role
  using (bucket_id = 'email-attachments')
  with check (bucket_id = 'email-attachments');

-- 4. Allow public to view attachments
drop policy if exists "Anyone can view email attachments" on storage.objects;
create policy "Anyone can view email attachments"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'email-attachments');
