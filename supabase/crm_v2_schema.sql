-- ─── CRM V2 Schema Update ─────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor to upgrade to Phase 2 (Mailbox & Roles)

-- 1. ─── Dynamic Roles ─────────────────────────────────────────────────────────

-- Create the roles table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  permissions jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now()
);

-- Seed default roles
insert into public.roles (name, permissions) values
('admin', '{"can_manage_roles": true, "can_manage_deals": true, "can_manage_contacts": true, "can_access_mailbox": true}'::jsonb),
('sales', '{"can_manage_roles": false, "can_manage_deals": true, "can_manage_contacts": true, "can_access_mailbox": true}'::jsonb)
on conflict (name) do nothing;

-- Enable RLS on roles
alter table public.roles enable row level security;

drop policy if exists "Authenticated users can view roles" on public.roles;
create policy "Authenticated users can view roles" on public.roles 
  for select to authenticated using (true);

drop policy if exists "Admins can manage roles" on public.roles;
create policy "Admins can manage roles" on public.roles 
  for all to authenticated 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Remove the hardcoded CHECK constraint on profiles.role so we can add dynamic roles
do $$ 
declare 
  const_name text; 
begin
  for const_name in
    select constraint_name from information_schema.constraint_column_usage 
    where table_name = 'profiles' and column_name = 'role'
  loop
    execute 'alter table public.profiles drop constraint if exists ' || const_name;
  end loop;
end $$;


-- 2. ─── Mailbox (Emails) ──────────────────────────────────────────────────────

create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  message_id text unique,
  from_address text not null,
  from_name text,
  to_addresses text[] not null,
  subject text,
  body_html text,
  body_text text,
  status text default 'inbox' check (status in ('inbox', 'sent', 'archived', 'trash')),
  thread_id text,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  read boolean default false,
  attachments_count integer default 0
);

alter table public.emails enable row level security;

drop policy if exists "Authenticated users can view emails" on public.emails;
create policy "Authenticated users can view emails" on public.emails 
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert emails" on public.emails;
create policy "Authenticated users can insert emails" on public.emails 
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update emails" on public.emails;
create policy "Authenticated users can update emails" on public.emails 
  for update to authenticated using (true);

drop policy if exists "Authenticated users can delete emails" on public.emails;
create policy "Authenticated users can delete emails" on public.emails 
  for delete to authenticated using (true);
