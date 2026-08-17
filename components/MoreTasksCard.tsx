"use client";

import styles from "./MoreTasksCard.module.css";

interface MoreTasksCardProps {
  onSelect: () => void;
}

export default function MoreTasksCard({ onSelect }: MoreTasksCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={styles.more}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.text}>+ Ещё 20 заданий</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </div>
  );
}
