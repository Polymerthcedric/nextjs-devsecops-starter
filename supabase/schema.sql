-- Supabase schema for the DevSecOps starter authentication.
-- Run this in the Supabase SQL editor to create the users table.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Insert the admin user. Generate the hash with:
--   node scripts/hash-password.mjs '<password>'
insert into public.users (username, password_hash, role)
values (
  'admin',
  'pbkdf2$210000$M10lPa1EV50LrDWXU35ENw==$O5EGKNQykU1QQKSyPvJohdb92q/neAc+nZg1Oe4++YtLUOo0uB03zthtc2Ly5HB384yL+oJyg4BsSeWdApTYMQ==',
  'admin'
)
on conflict (username) do nothing;

-- RLS: the service-role key used by the server bypasses RLS, so keep
-- row-level security enabled to protect the table from direct client access.
alter table public.users enable row level security;
