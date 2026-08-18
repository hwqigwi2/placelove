"use client";

import type { HistoryItem } from "@/lib/history";
import { haptic } from "./telegram";
import styles from "./History.module.css";

interface HistoryProps {
  items: HistoryItem[];
  onGoHome: () => void;
}

export default function History({ items, onGoHome }: HistoryProps) {
  return (
    <section className={styles.section}>
      <h1 className={styles.heading}>История выполненных заданий</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.iconWrap} aria-hidden="true">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <p className={styles.emptyTitle}>Пока здесь ничего нет</p>
          <p className={styles.emptyText}>
            Выполненные задания появятся здесь.
          </p>
          <button
            type="button"
            className={styles.cta}
            onClick={() => {
              haptic("impact");
              onGoHome();
            }}
          >
            Перейти к заданиям
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
