"use client";

import Image from "next/image";
import type { PublicUser } from "@/lib/types";
import Avatar from "./Avatar";
import { haptic } from "./telegram";
import styles from "./Header.module.css";

interface HeaderProps {
  user: PublicUser | null;
  onProfileClick: () => void;
}

export default function Header({ user, onProfileClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image
            src="/logo.png"
            alt="PlaceLove"
            width={34}
            height={34}
            className={styles.logo}
            priority
          />
          <span className={styles.name}>PlaceLove</span>
        </div>
        <button
          type="button"
          className={styles.profileButton}
          onClick={() => {
            haptic("selection");
            onProfileClick();
          }}
          aria-label="Открыть профиль"
        >
          <Avatar user={user} size={36} />
        </button>
      </div>
    </header>
  );
}
