"use client";

import styles from "./Toast.module.css";

interface ToastProps {
  message: string | null;
}

/** Небольшая плашка над нижней навигацией (скрывается таймером снаружи). */
export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  );
}
