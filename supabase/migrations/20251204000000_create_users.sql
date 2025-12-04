-- Create users table to store signup/login details
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  sabha_name text not null,
  karyakar_number text not null,
  username text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Ensure RLS is disabled for simplicity (enable and configure policies for production)
alter table public.users disable row level security;
