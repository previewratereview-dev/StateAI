-- ─── Contact Interactions Schema Update ─────────────────────────────────────────
-- Run this in the Supabase SQL Editor to add multi-channel interaction support

-- 1. ─── Update activities type check to include new channels ─────────────────────
DO $$
BEGIN
  -- Drop the existing check constraint on activities.type
  EXECUTE (
    SELECT 'ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS ' || constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'activities' AND constraint_type = 'CHECK'
    AND constraint_name LIKE '%type%'
    LIMIT 1
  );

  -- Add updated check constraint with new interaction channels
  EXECUTE 'ALTER TABLE public.activities ADD CONSTRAINT activities_type_check 
    CHECK (type IN (
      ''note'', ''call'', ''email'', ''meeting'', 
      ''status_change'', ''task_done'', ''deal_created'', ''contact_created'',
      ''social_dm'', ''cold_call'', ''whatsapp'', ''linkedin_message'', 
      ''sms'', ''other_interaction''
    ))';
END $$;

-- 2. ─── Create contact_status_history table ─────────────────────────────────────
create table if not exists public.contact_status_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  reason text,
  metadata jsonb default '{}'::jsonb
);

alter table public.contact_status_history enable row level security;

drop policy if exists "Authenticated users can view status history" on public.contact_status_history;
create policy "Authenticated users can view status history" on public.contact_status_history
  for select to authenticated using (true);

drop policy if exists "Authenticated users can insert status changes" on public.contact_status_history;
create policy "Authenticated users can insert status changes" on public.contact_status_history
  for insert to authenticated with check (true);

-- 3. ─── Update contacts table to add more status options ────────────────────────
-- First, drop the old check constraint that limits status values
DO $$
BEGIN
  EXECUTE (
    SELECT 'ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS ' || constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'contacts' AND constraint_type = 'CHECK'
    AND constraint_name LIKE '%status%'
    LIMIT 1
  );
END $$;

-- Now migrate existing statuses to new values (constraint is already gone)
UPDATE public.contacts SET status = 'new' WHERE status = 'lead';
UPDATE public.contacts SET status = 'contacted' WHERE status = 'prospect';
UPDATE public.contacts SET status = 'won' WHERE status = 'customer';

-- Add new expanded check constraint with more lead statuses
ALTER TABLE public.contacts ADD CONSTRAINT contacts_status_check 
  CHECK (status IN (
    'new', 'contacted', 'qualified', 'proposal', 
    'negotiation', 'won', 'lost', 'churned'
  ));
