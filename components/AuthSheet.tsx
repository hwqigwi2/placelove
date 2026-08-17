"use client";

import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import type { PublicUser } from "@/lib/types";
import {
  isValidEmail,
  isValidPassword,
  isValidTelegramUsername,
  MIN_PASSWORD_LENGTH,
} from "@/lib/validation";
import styles from "./AuthSheet.module.css";

export type AuthMode = "register" | "login";

interface AuthSheetProps {
  open: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: (user: PublicUser) => void;
}

type FieldErrors = Partial<Record<string, string>>;

export default function AuthSheet({
  open,
  initialMode,
  onClose,
  onSuccess,
}: AuthSheetProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Сброс состояния при каждом открытии
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrors({});
      setFormError("");
      setEmailTaken(false);
      setLoading(false);
      setRegistered(false);
    }
  }, [open, initialMode]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setFormError("");
    setEmailTaken(false);
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!isValidEmail(email)) next.email = "Введите корректный email";
    if (mode === "register" && !isValidTelegramUsername(telegram)) {
      next.telegram = "3–32 символа: a-z, 0-9 и _";
    }
    if (!isValidPassword(password)) {
      next.password = `Минимум ${MIN_PASSWORD_LENGTH} символов`;
    }
    if (mode === "register" && passwordRepeat !== password) {
      next.passwordRepeat = "Пароли не совпадают";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // защита от двойной отправки
    setFormError("");
    setEmailTaken(false);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload =
        mode === "register"
          ? { email, telegram_username: telegram, password }
          : { email, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        user?: PublicUser;
        error?: string;
        field?: string;
        code?: string;
      };

      if (!res.ok || !data.user) {
        if (data.code === "EMAIL_TAKEN") {
          setEmailTaken(true);
          setFormError(data.error ?? "");
        } else if (data.field) {
          setErrors({ [data.field]: data.error ?? "Ошибка" });
        } else {
          setFormError(data.error ?? "Что-то пошло не так. Попробуйте позже.");
        }
        return;
      }

      if (mode === "register") {
        // Краткое состояние успеха «Аккаунт создан»
        setRegistered(true);
        const user = data.user;
        setTimeout(() => onSuccess(user), 1200);
      } else {
        onSuccess(data.user);
      }
    } catch {
      setFormError("Нет соединения. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <BottomSheet open={open} onClose={() => {}} title="Создать аккаунт">
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.successTitle}>Аккаунт создан</p>
          <p className={styles.successText}>
            Добро пожаловать в PlaceLove!
          </p>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={mode === "register" ? "Создать аккаунт" : "Войти"}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          {errors.email && (
            <span className={styles.error}>{errors.email}</span>
          )}
        </label>

        {mode === "register" && (
          <label className={styles.field}>
            <span className={styles.label}>Telegram username</span>
            <input
              type="text"
              className={`${styles.input} ${errors.telegram ? styles.inputError : ""}`}
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              autoComplete="off"
              placeholder="@username"
              required
            />
            {errors.telegram && (
              <span className={styles.error}>{errors.telegram}</span>
            )}
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Пароль</span>
          <input
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            placeholder={
              mode === "register" ? `Минимум ${MIN_PASSWORD_LENGTH} символов` : "Ваш пароль"
            }
            required
          />
          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}
        </label>

        {mode === "register" && (
          <label className={styles.field}>
            <span className={styles.label}>Повторите пароль</span>
            <input
              type="password"
              className={`${styles.input} ${errors.passwordRepeat ? styles.inputError : ""}`}
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              autoComplete="new-password"
              placeholder="Ещё раз"
              required
            />
            {errors.passwordRepeat && (
              <span className={styles.error}>{errors.passwordRepeat}</span>
            )}
          </label>
        )}

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}{" "}
            {emailTaken && (
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => switchMode("login")}
              >
                Войти
              </button>
            )}
          </p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={loading}
        >
          {loading && <span className={styles.spinner} aria-hidden="true" />}
          {mode === "register" ? "Зарегистрироваться" : "Войти"}
        </button>

        <p className={styles.switch}>
          {mode === "register" ? (
            <>
              Уже есть аккаунт?{" "}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => switchMode("login")}
              >
                Войти
              </button>
            </>
          ) : (
            <>
              Нет аккаунта?{" "}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => switchMode("register")}
              >
                Зарегистрироваться
              </button>
            </>
          )}
        </p>
      </form>
    </BottomSheet>
  );
}
