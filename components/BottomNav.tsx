"use client";

import { haptic } from "./telegram";
import styles from "./BottomNav.module.css";

export type NavView = "home" | "history" | "profile";

interface BottomNavProps {
  view: NavView;
  onChange: (view: NavView) => void;
}

function HomeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV: { id: NavView; label: string; Icon: () => React.ReactElement }[] = [
  { id: "home", label: "Главная", Icon: HomeIcon },
  { id: "history", label: "История", Icon: HistoryIcon },
  { id: "profile", label: "Профиль", Icon: ProfileIcon },
];

export default function BottomNav({ view, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <div className={styles.inner}>
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.item} ${view === id ? styles.active : ""}`}
            onClick={() => {
              haptic("selection");
              onChange(id);
            }}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon />
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
