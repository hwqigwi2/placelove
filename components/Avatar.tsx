"use client";

import type { PublicUser } from "@/lib/types";
import styles from "./Avatar.module.css";

interface AvatarProps {
  user: PublicUser | null;
  size?: number;
}

/**
 * Круглый Telegram-аватар. Если photo_url отсутствует —
 * fallback с первой буквой first_name на фиолетовом градиенте.
 */
export default function Avatar({ user, size = 36 }: AvatarProps) {
  const letter = (user?.first_name?.trim().charAt(0) || "P").toUpperCase();

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
      aria-hidden="true"
    >
      {user?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar_url}
          alt=""
          className={styles.image}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
        />
      ) : (
        letter
      )}
    </span>
  );
}
