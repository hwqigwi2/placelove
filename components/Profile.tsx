"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PublicUser } from "@/lib/types";
import {
  BALANCE_TOAST_MS,
  MIN_WITHDRAWAL_RUB,
  TELEGRAM_MANAGER_URL,
} from "@/lib/constants";
import Avatar from "./Avatar";
import Toast from "./Toast";
import { haptic, openSmartLink } from "./telegram";
import styles from "./Profile.module.css";

interface ProfileProps {
  user: PublicUser | null;
}

const WITHDRAWAL_MESSAGE = `Минимальная сумма для вывода — ${MIN_WITHDRAWAL_RUB.toLocaleString("ru-RU")} ₽`;

export default function Profile({ user }: ProfileProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const showToast = () => {
    haptic("impact");
    setToast(WITHDRAWAL_MESSAGE);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), BALANCE_TOAST_MS);
  };

  return (
    <section className={styles.section}>
      <div className={styles.identity}>
        <Avatar user={user} size={84} />
        <h1 className={styles.name}>{user?.first_name ?? "Гость"}</h1>
        {user?.username ? (
          <p className={styles.username}>@{user.username}</p>
        ) : (
          <p className={styles.usernameMuted}>Username не указан</p>
        )}
      </div>

      <button
        type="button"
        className={styles.balance}
        onClick={showToast}
        aria-label="Баланс"
      >
        <Image
          src="/balance.png"
          alt="Баланс"
          width={1774}
          height={887}
          className={styles.balanceImage}
          priority
        />
      </button>

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span
            className={`${styles.dot} ${
              user?.is_active ? styles.dotActive : styles.dotInactive
            }`}
            aria-hidden="true"
          />
          <span className={styles.statusText}>
            {user?.is_active
              ? "Аккаунт активирован"
              : "Аккаунт не активирован"}
          </span>
        </div>
        {!user?.is_active && (
          <button
            type="button"
            className={styles.activate}
            onClick={() => {
              haptic("impact");
              openSmartLink(TELEGRAM_MANAGER_URL);
            }}
          >
            Активировать аккаунт
          </button>
        )}
      </div>

      <Toast message={toast} />
    </section>
  );
}
