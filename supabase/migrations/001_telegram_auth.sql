-- Миграция: переход PlaceLove на Telegram Mini App авторизацию.
--
-- Старая модель (email / password_hash / telegram_username) заменяется на
-- Telegram-модель (telegram_id / first_name / username / avatar_url).
--
-- ВАЖНО: старые email-аккаунты невозможно автоматически сопоставить с
-- telegram_id, поэтому строки без telegram_id удаляются на шаге 2.
-- Если в таблице есть важные данные — сделайте бэкап перед применением.
--
-- Применить: Supabase Dashboard -> SQL Editor.

begin;

-- 1. Добавляем новые колонки (пока nullable, чтобы миграция прошла на
--    таблице со старыми строками).
alter table public.users
  add column if not exists telegram_id bigint,
  add column if not exists first_name text,
  add column if not exists username text,
  add column if not exists avatar_url text;

-- 2. Удаляем старые email-аккаунты: у них нет telegram_id, войти под ними
--    через Mini App всё равно нельзя. Новые пользователи создаются
--    автоматически при первом открытии приложения.
delete from public.users where telegram_id is null;

-- 3. Жёсткие ограничения новой модели.
alter table public.users
  alter column telegram_id set not null,
  alter column first_name set not null;

create unique index if not exists users_telegram_id_idx
  on public.users (telegram_id);

-- 4. Убираем старую email-модель.
drop index if exists public.users_email_lower_idx;

alter table public.users
  drop column if exists email,
  drop column if exists password_hash,
  drop column if exists telegram_username;

commit;

-- RLS и триггер updated_at не меняются (см. supabase/schema.sql).
-- После миграции таблица соответствует supabase/schema.sql.
