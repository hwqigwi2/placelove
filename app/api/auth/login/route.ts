import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { toPublicUser, type DbUser } from "@/lib/types";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import {
  getClientIp,
  limitLogin,
} from "@/lib/ratelimit";

const INVALID_CREDENTIALS =
  "Неверный email или пароль";

const TOO_MANY_REQUESTS =
  "Слишком много попыток. Попробуйте позже.";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Некорректный запрос",
      },
      {
        status: 400,
      },
    );
  }

  const rate = await limitLogin(
    getClientIp(request),
    typeof body.email === "string"
      ? body.email
      : undefined,
  );

  if (!rate.success) {
    return NextResponse.json(
      {
        error: TOO_MANY_REQUESTS,
      },
      {
        status: rate.misconfigured
          ? 503
          : 429,
      },
    );
  }

  const { email, password } = body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !isValidEmail(email) ||
    password.length === 0
  ) {
    return NextResponse.json(
      {
        error: INVALID_CREDENTIALS,
      },
      {
        status: 401,
      },
    );
  }

  let data;
  let error;

  try {
    const result = await getSupabaseAdmin()
      .from("users")
      .select()
      .eq(
        "email",
        normalizeEmail(email),
      )
      .maybeSingle();

    data = result.data;
    error = result.error;
  } catch {
    return NextResponse.json(
      {
        error:
          "Ошибка сервера. Попробуйте позже.",
      },
      {
        status: 500,
      },
    );
  }

  if (error) {
    console.error(
      "Login database error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Ошибка сервера. Попробуйте позже.",
      },
      {
        status: 500,
      },
    );
  }

  const user = data as DbUser | null;

  /*
   * Даже если пользователь не найден,
   * выполняем bcrypt.compare с фиктивным hash.
   *
   * Это уменьшает возможность определения
   * существования email по времени ответа.
   */
  const hashToCheck =
    user?.password_hash ??
    "$2b$10$C6UzMDM.H6dfI/f/IKcEeO7ZB9v6CpgGkXqK1yQfV0J0E3m5q7W8a";

  const passwordMatches =
    await bcrypt.compare(
      password,
      hashToCheck,
    );

  if (
    !user ||
    !passwordMatches
  ) {
    return NextResponse.json(
      {
        error: INVALID_CREDENTIALS,
      },
      {
        status: 401,
      },
    );
  }

  await setSessionCookie(user.id);

  return NextResponse.json({
    user: toPublicUser(user),
  });
}