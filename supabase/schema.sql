-- PlaceLove: схема базы данных (Supabase / PostgreSQL)
-- Telegram Mini App: пользователь создаётся автоматически при первом
-- открытии приложения (upsert по telegram_id). Email/паролей нет.
-- Применить: Supabase Dashboard -> SQL Editor, или `supabase db push`.
--
-- Если в базе уже есть старая таблица users (email/password_hash),
-- сначала примените миграцию supabase/migrations/001_telegram_auth.sql.

-- ---------------------------------------------------------------------------
-- Таблица users
-- Идентификатор — telegram_id из подписанного Telegram initData.
-- is_active всегда создаётся false; активация выполняется вручную менеджером
-- (автоматической активации в приложении нет, upsert её не сбрасывает).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  first_name text not null,
  username text,
  avatar_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
