-- ─── Jobs / Careers Schema ─────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor

create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text unique not null,
  department text not null,
  location text not null,
  type text default 'full-time' not null check (type in ('full-time', 'part-time', 'contract', 'internship', 'freelance', 'commission')),
  description text not null,
  requirements text not null,
  responsibilities text not null,
  salary_min numeric(10, 2),
  salary_max numeric(10, 2),
  salary_currency text default 'USD',
  status text default 'draft' not null check (status in ('active', 'inactive', 'draft')),
  featured boolean default false,
  application_url text,
  created_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Anyone can view active jobs (public)
drop policy if exists "Anyone can view active jobs" on public.jobs;
create policy "Anyone can view active jobs" on public.jobs
  for select using (status = 'active');

-- Authenticated users can view all jobs (CRM view)
drop policy if exists "Authenticated users can view all jobs" on public.jobs;
create policy "Authenticated users can view all jobs" on public.jobs
  for select to authenticated using (true);

-- Admins can insert jobs
drop policy if exists "Admins can insert jobs" on public.jobs;
create policy "Admins can insert jobs" on public.jobs
  for insert to authenticated with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update jobs
drop policy if exists "Admins can update jobs" on public.jobs;
create policy "Admins can update jobs" on public.jobs
  for update to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can delete jobs
drop policy if exists "Admins can delete jobs" on public.jobs;
create policy "Admins can delete jobs" on public.jobs
  for delete to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Updated at trigger
drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- Auto-generate slug function
create or replace function public.generate_job_slug(title text)
returns text language plpgsql as $$
declare
  base_slug text;
  final_slug text;
  counter int := 1;
begin
  base_slug := lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  final_slug := base_slug;
  while exists (select 1 from public.jobs where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  return final_slug;
end;
$$;