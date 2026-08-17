-- PlaceLove: схема базы данных (Supabase / PostgreSQL)
-- Применить: Supabase Dashboard -> SQL Editor, или `supabase db push`.

-- Расширение для case-insensitive email
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Таблица users
-- Пароли хранятся ТОЛЬКО в виде bcrypt-хэша (password_hash).
-- is_active всегда создаётся false; активация выполняется вручную менеджером
-- (автоматической активации в приложении нет).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  telegram_username text not null,
  password_hash text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Индекс по lower(email) — дополнительная гарантия уникальности без учёта регистра
create unique index if not exists users_email_lower_idx
  on public.users (lower(email::text));

-- Триггер updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Таблица доступна ТОЛЬКО через service role с сервера.
-- Anon/authenticated-ключам доступ запрещён: RLS включён и нет ни одной
-- политики для публичных ролей (service role обходит RLS по умолчанию).
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

-- Явно отзываем права у публичных ролей на всякий случай
revoke all on public.users from anon;
revoke all on public.users from authenticated;
