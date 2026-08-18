"use client";

import { useState } from "react";
import BottomSheet from "./BottomSheet";
import { haptic } from "./telegram";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    title: "Выбираете задание",
    text: "Карточки товаров Wildberries и Ozon с фиксированным вознаграждением.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Выполняете по шагам",
    text: "Индивидуальные пошаговые задания — всего 2–3 дня.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    title: "Получаете вознаграждение",
    text: "За каждое выполненное задание — на баланс в приложении.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.983 22v-3" />
        <path d="M12 2v3" />
        <path d="M15.5 5.5 12 2 8.5 5.5" />
        <path d="M6 12a6 6 0 0 0 12 0 6 6 0 1 0-12 0" />
        <path d="m9.5 10 2.5 2.5L14.5 10" />
      </svg>
    ),
  },
];

/** Компактный инфо-блок на главной + BottomSheet с описанием PlaceLove. */
export default function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.card}
        onClick={() => {
          haptic("selection");
          setOpen(true);
        }}
      >
        <span className={styles.badge} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </span>
        <span className={styles.cardText}>
          <span className={styles.cardTitle}>Как это работает</span>
          <span className={styles.cardSubtitle}>
            Коротко о заданиях PlaceLove
          </span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Как это работает"
      >
        <div className={styles.sheetBody}>
          <p className={styles.paragraph}>
            Когда магазины привозят новые товары на маркетплейсы, их карточки
            оказываются на самом дне поиска, где их никто не видит. Наша
            задача — поднять их в ТОП и вывести в лидеры продаж.
          </p>
          <p className={styles.paragraph}>
            Мы помогаем продвигать эти карточки: оформляем официальные
            внутренние доступы для работы, получаем тестовые партии товаров
            для поднятия рейтинга и пишем первые отзывы.
          </p>
          <p className={styles.paragraph}>
            Все задания индивидуальные, пошаговые и занимают всего 2–3 дня.
          </p>

          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <div key={step.title} className={styles.step}>
                <span className={styles.stepIcon} aria-hidden="true">
                  {step.icon}
                </span>
                <span className={styles.stepBody}>
                  <span className={styles.stepTitle}>
                    {index + 1}. {step.title}
                  </span>
                  <span className={styles.stepText}>{step.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
