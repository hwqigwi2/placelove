"use client";

import Image from "next/image";
import type { PublicUser } from "@/lib/types";
import styles from "./Header.module.css";

interface HeaderProps {
  user: PublicUser | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export default function Header({
  user,
  onLoginClick,
  onProfileClick,
}: HeaderProps) {
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
        {user ? (
          <button
            type="button"
            className={styles.profile}
            onClick={onProfileClick}
          >
            <span className={styles.avatar} aria-hidden="true">
              👤
            </span>
            <span className={styles.profileName}>{user.email}</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.login}
            onClick={onLoginClick}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
}
