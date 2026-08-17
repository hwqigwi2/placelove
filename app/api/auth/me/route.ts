import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { toPublicUser, type DbUser } from "@/lib/types";

/**
 * Возвращает текущего пользователя.
 * is_active каждый раз читается из БД — клиент не может подделать статус.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  return NextResponse.json({ user: toPublicUser(data as DbUser) });
}
