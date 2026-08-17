import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import {
  toPublicUser,
  type DbUser,
} from "@/lib/types";
import {
  isValidEmail,
  isValidPassword,
  isValidTelegramUsername,
  normalizeEmail,
  normalizeTelegramUsername,
} from "@/lib/validation";
import {
  getClientIp,
  limitRegister,
} from "@/lib/ratelimit";

const BCRYPT_COST = 10;

const TOO_MANY_REQUESTS =
  "Слишком много попыток. Попробуйте позже.";

interface RegisterBody {
  email?: unknown;
  telegram_username?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  let body: RegisterBody;

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

  const rate = await limitRegister(
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
        status: 429,
      },
    );
  }

  const {
    email,
    telegram_username: telegramUsername,
    password,
  } = body;

  if (
    typeof email !== "string" ||
    !isValidEmail(email)
  ) {
    return NextResponse.json(
      {
        error: "Введите корректный email",
        field: "email",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof telegramUsername !== "string" ||
    !isValidTelegramUsername(
      telegramUsername,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Username Telegram: 3–32 символа, a-z, 0-9 и _",
        field: "telegram_username",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof password !== "string" ||
    !isValidPassword(password)
  ) {
    return NextResponse.json(
      {
        error:
          "Пароль должен быть не короче 6 символов",
        field: "password",
      },
      {
        status: 400,
      },
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedTelegram =
    normalizeTelegramUsername(
      telegramUsername,
    );

  const passwordHash =
    await bcrypt.hash(
      password,
      BCRYPT_COST,
    );

  try {
    const {
      data,
      error,
    } = await getSupabaseAdmin()
      .from("users")
      .insert({
        email: normalizedEmail,
        telegram_username:
          normalizedTelegram,
        password_hash: passwordHash,
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Этот аккаунт уже существует. Войдите в аккаунт.",
            code: "EMAIL_TAKEN",
          },
          {
            status: 409,
          },
        );
      }

      console.error(
        "Registration database error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Не удалось создать аккаунт. Попробуйте позже.",
        },
        {
          status: 500,
        },
      );
    }

    const user = data as DbUser;

    await setSessionCookie(user.id);

    return NextResponse.json(
      {
        user: toPublicUser(user),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Не удалось создать аккаунт. Попробуйте позже.",
      },
      {
        status: 500,
      },
    );
  }
}