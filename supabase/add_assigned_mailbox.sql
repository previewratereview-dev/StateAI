-- ─── Add assigned_mailbox to profiles ────────────────────────────────────────
-- Run this in the Supabase SQL Editor

-- 1. Add the column
alter table public.profiles
  add column if not exists assigned_mailbox text;

-- 2. Allow admins to INSERT new profiles (needed when creating users via admin API)
drop policy if exists "Admin can insert profiles" on public.profiles;
create policy "Admin can insert profiles" on public.profiles
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 3. Update the trigger to populate role + assigned_mailbox from user metadata
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
