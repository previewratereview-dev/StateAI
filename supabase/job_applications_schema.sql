-- ─── Job Applications Schema ──────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor

create table if not exists public.job_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  linkedin_url text,
  portfolio_url text,
  website_url text,
  resume_url text,
  cover_letter text,
  expected_salary numeric(10, 2),
  currency text default 'USD',
  currently_employed boolean default false,
  start_date text,
  status text default 'new' not null check (status in ('new', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  admin_notes text,
  created_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS
alter table public.job_applications enable row level security;

-- Anyone can insert (public application submission)
drop policy if exists "Anyone can submit applications" on public.job_applications;
create policy "Anyone can submit applications" on public.job_applications
  for insert to anon, authenticated with check (true);

-- Authenticated users can view applications (CRM)
drop policy if exists "Authenticated users can view applications" on public.job_applications;
create policy "Authenticated users can view applications" on public.job_applications
  for select to authenticated using (true);

-- Admins can update applications
drop policy if exists "Admins can update applications" on public.job_applications;
create policy "Admins can update applications" on public.job_applications
  for update to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can delete applications
drop policy if exists "Admins can delete applications" on public.job_applications;
create policy "Admins can delete applications" on public.job_applications
  for delete to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Updated at trigger
drop trigger if exists job_applications_updated_at on public.job_applications;
create trigger job_applications_updated_at before update on public.job_applications
  for each row execute procedure public.set_updated_at();