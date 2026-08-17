"use client";

import { useState } from "react";
import Header from "./Header";
import ProductCard from "./ProductCard";
import MoreTasksCard from "./MoreTasksCard";
import AuthSheet, { type AuthMode } from "./AuthSheet";
import ActivationSheet from "./ActivationSheet";
import ProfileSheet from "./ProfileSheet";
import BottomSheet from "./BottomSheet";
import { PRODUCTS } from "@/lib/products";
import type { PublicUser } from "@/lib/types";
import styles from "./AppShell.module.css";

type SheetState =
  | { type: "auth"; mode: AuthMode }
  | { type: "activation" }
  | { type: "profile" }
  | { type: "soon" }
  | null;

interface AppShellProps {
  initialUser: PublicUser | null;
  authUnavailable?: boolean;
}

export default function AppShell({
  initialUser,
  authUnavailable = false,
}: AppShellProps) {
  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [sheet, setSheet] = useState<SheetState>(null);

  const closeSheet = () => setSheet(null);

  const handleProtectedAction = () => {
    if (authUnavailable) {
      setSheet({ type: "soon" });
      return;
    }

    if (!user) {
      setSheet({ type: "auth", mode: "register" });
      return;
    }

    if (!user.is_active) {
      setSheet({ type: "activation" });
      return;
    }

    setSheet({ type: "soon" });
  };

  const handleAuthSuccess = (nextUser: PublicUser) => {
    setUser(nextUser);
    setSheet(null);
  };

  const handleLogout = () => {
    setUser(null);
    setSheet(null);
  };

  return (
    <div className={styles.page}>
      <Header
        user={user}
        onLoginClick={() => setSheet({ type: "auth", mode: "login" })}
        onProfileClick={() => setSheet({ type: "profile" })}
      />

      {authUnavailable && (
        <div
          role="status"
          aria-live="polite"
          className={styles.authUnavailable}
        >
          Сервис временно недоступен. Попробуйте обновить страницу позже.
        </div>
      )}

      <main className={styles.main}>
        <h1 className={styles.heading}>Задания с вознаграждением</h1>

        <p className={styles.subheading}>
          Выполняйте задания и получайте вознаграждения.
        </p>

        <div className={styles.grid}>
          {PRODUCTS.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onSelect={handleProtectedAction}
            />
          ))}
        </div>

        <MoreTasksCard onSelect={handleProtectedAction} />
      </main>

      <AuthSheet
        open={sheet?.type === "auth"}
        initialMode={sheet?.type === "auth" ? sheet.mode : "register"}
        onClose={closeSheet}
        onSuccess={handleAuthSuccess}
      />

      <ActivationSheet
        open={sheet?.type === "activation"}
        onClose={closeSheet}
      />

      {user && (
        <ProfileSheet
          open={sheet?.type === "profile"}
          user={user}
          onClose={closeSheet}
          onLogout={handleLogout}
        />
      )}

      <BottomSheet
        open={sheet?.type === "soon"}
        onClose={closeSheet}
        title="Задание"
      >
        <p className={styles.soonText}>
          Сервис временно недоступен. Попробуйте позже.
        </p>
      </BottomSheet>
    </div>
  );
}