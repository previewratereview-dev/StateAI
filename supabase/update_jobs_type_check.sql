-- Run this in your Supabase SQL Editor to fix the jobs type check constraint
-- This adds 'commission' to the allowed job types

-- First, drop the existing check constraint
alter table public.jobs drop constraint if exists jobs_type_check;

-- Then recreate it with 'commission' included
alter table public.jobs add constraint jobs_type_check 
  check (type in ('full-time', 'part-time', 'contract', 'internship', 'freelance', 'commission'));