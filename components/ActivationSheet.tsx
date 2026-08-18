"use client";

import BottomSheet from "./BottomSheet";
import { TELEGRAM_MANAGER_URL } from "@/lib/constants";
import { haptic, openSmartLink } from "./telegram";
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
    <BottomSheet open={open} onClose={onClose} title="Активируйте аккаунт">
      <div className={styles.stack}>
        <p className={styles.text}>
          Чтобы получить доступ к заданиям, активируйте аккаунт у менеджера.
        </p>
        <button
          type="button"
          className={styles.primaryLink}
          onClick={() => {
            haptic("impact");
            openSmartLink(TELEGRAM_MANAGER_URL);
          }}
        >
          Активировать аккаунт
        </button>
      </div>
    </BottomSheet>
  );
}
