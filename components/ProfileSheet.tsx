"use client";

import { useState } from "react";
import BottomSheet from "./BottomSheet";
import type { PublicUser } from "@/lib/types";
import { TELEGRAM_MANAGER_URL } from "@/lib/constants";
import styles from "./SheetContent.module.css";

interface ProfileSheetProps {
  open: boolean;
  user: PublicUser;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileSheet({
  open,
  user,
  onClose,
  onLogout,
}: ProfileSheetProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
      onLogout();
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Ваш аккаунт">
      <div className={styles.stack}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{user.email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Telegram</span>
          <span className={styles.infoValue}>{user.telegram_username}</span>
        </div>
        <div className={styles.status}>
          <span
            className={`${styles.dot} ${user.is_active ? styles.dotActive : styles.dotInactive}`}
            aria-hidden="true"
          />
          {user.is_active ? "Аккаунт активирован" : "Аккаунт не активирован"}
        </div>
        {!user.is_active && (
          <a
            className={styles.primaryLink}
            href={TELEGRAM_MANAGER_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Активировать аккаунт
          </a>
        )}
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Выходим…" : "Выйти"}
        </button>
      </div>
    </BottomSheet>
  );
}
