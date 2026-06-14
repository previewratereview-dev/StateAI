-- ─── CRM Schema Extension ─────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor after the base schema.sql

-- ─── Profiles (user roles) ────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  role text default 'sales' not null check (role in ('admin', 'sales')),
  avatar_url text,
  assigned_mailbox text
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view all profiles" on public.profiles;
create policy "Users can view all profiles" on public.profiles
  for select to authenticated using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

drop policy if exists "Admin can update any profile" on public.profiles;
create policy "Admin can update any profile" on public.profiles
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin can insert profiles" on public.profiles;
create policy "Admin can insert profiles" on public.profiles
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, assigned_mailbox)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'sales'),
    new.raw_user_meta_data->>'assigned_mailbox'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Contacts ─────────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  company text,
  job_title text,
  website text,
  status text default 'lead' not null check (status in ('lead', 'customer', 'churned', 'prospect')),
  lead_source text default 'other' check (lead_source in ('website', 'referral', 'social', 'email', 'cold_call', 'event', 'other')),
  tags text[] default '{}',
  notes text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.contacts enable row level security;

drop policy if exists "Authenticated users can view contacts" on public.contacts;
create policy "Authenticated users can view contacts" on public.contacts
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert contacts" on public.contacts;
create policy "Authenticated users can insert contacts" on public.contacts
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update contacts" on public.contacts;
create policy "Authenticated users can update contacts" on public.contacts
  for update to authenticated using (true);

drop policy if exists "Admin can delete contacts" on public.contacts;
create policy "Admin can delete contacts" on public.contacts
  for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc'::text, now()); return new; end;
$$;

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at before update on public.contacts
  for each row execute procedure public.set_updated_at();


-- ─── Deals ────────────────────────────────────────────────────────────────────
create table if not exists public.deals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  value numeric(12, 2) default 0,
  stage text default 'new' not null check (stage in ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability integer default 10 check (probability >= 0 and probability <= 100),
  expected_close_date date,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  lost_reason text
);

alter table public.deals enable row level security;

drop policy if exists "Authenticated users can view deals" on public.deals;
create policy "Authenticated users can view deals" on public.deals
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert deals" on public.deals;
create policy "Authenticated users can insert deals" on public.deals
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update deals" on public.deals;
create policy "Authenticated users can update deals" on public.deals
  for update to authenticated using (true);

drop policy if exists "Admin can delete deals" on public.deals;
create policy "Admin can delete deals" on public.deals
  for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop trigger if exists deals_updated_at on public.deals;
create trigger deals_updated_at before update on public.deals
  for each row execute procedure public.set_updated_at();


-- ─── Tasks ────────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  due_date timestamp with time zone,
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'open' not null check (status in ('open', 'in_progress', 'done')),
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.tasks enable row level security;

drop policy if exists "Authenticated users can view tasks" on public.tasks;
create policy "Authenticated users can view tasks" on public.tasks
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert tasks" on public.tasks;
create policy "Authenticated users can insert tasks" on public.tasks
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update tasks" on public.tasks;
create policy "Authenticated users can update tasks" on public.tasks
  for update to authenticated using (true);

drop policy if exists "Authenticated users can delete tasks" on public.tasks;
create policy "Authenticated users can delete tasks" on public.tasks
  for delete to authenticated using (true);

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();


-- ─── Activities ───────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('note', 'call', 'email', 'meeting', 'status_change', 'task_done', 'deal_created', 'contact_created')),
  content text,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  metadata jsonb default '{}'
);

alter table public.activities enable row level security;

drop policy if exists "Authenticated users can view activities" on public.activities;
create policy "Authenticated users can view activities" on public.activities
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert activities" on public.activities;
create policy "Authenticated users can insert activities" on public.activities
  for insert to authenticated with check (true);


-- ─── Notes ────────────────────────────────────────────────────────────────────
create table if not exists public.crm_notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  body text not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.crm_notes enable row level security;

drop policy if exists "Authenticated users can view notes" on public.crm_notes;
create policy "Authenticated users can view notes" on public.crm_notes
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert notes" on public.crm_notes;
create policy "Authenticated users can insert notes" on public.crm_notes
  for insert to authenticated with check (true);

drop policy if exists "Authors can update own notes" on public.crm_notes;
create policy "Authors can update own notes" on public.crm_notes
  for update to authenticated using (created_by = auth.uid());

drop policy if exists "Authors or admin can delete notes" on public.crm_notes;
create policy "Authors or admin can delete notes" on public.crm_notes
  for delete to authenticated
  using (created_by = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
