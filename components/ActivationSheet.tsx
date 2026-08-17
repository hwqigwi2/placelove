"use client";

import BottomSheet from "./BottomSheet";
import { TELEGRAM_MANAGER_URL } from "@/lib/constants";
import styles from "./SheetContent.module.css";

interface ActivationSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function ActivationSheet({
  open,
  onClose,
}: ActivationSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Необходимо активировать аккаунт">
      <div className={styles.stack}>
        <p className={styles.text}>
          Чтобы получить доступ к заданиям, напишите нашему менеджеру.
        </p>
        <a
          className={styles.primaryLink}
          href={TELEGRAM_MANAGER_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Активировать аккаунт
        </a>
      </div>
    </BottomSheet>
  );
}
