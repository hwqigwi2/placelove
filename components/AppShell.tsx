"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "./Header";
import ProductCard from "./ProductCard";
import MoreTasksCard from "./MoreTasksCard";
import ActivationSheet from "./ActivationSheet";
import BottomSheet from "./BottomSheet";
import BottomNav, { type NavView } from "./BottomNav";
import History from "./History";
import Profile from "./Profile";
import HowItWorks from "./HowItWorks";
import { PRODUCTS } from "@/lib/products";
import { requiresActivation } from "@/lib/activation";
import { getHistoryItems } from "@/lib/history";
import type { PublicUser } from "@/lib/types";
import { haptic, telegram } from "./telegram";
import styles from "./AppShell.module.css";

type SheetState = { type: "activation" } | { type: "soon" } | null;

export default function AppShell() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [view, setView] = useState<NavView>("home");
  const [sheet, setSheet] = useState<SheetState>(null);

  // Telegram bootstrap: ready() + expand(), затем отправляем initData
  // на сервер — он проверяет HMAC-подпись и делает upsert пользователя.
  useEffect(() => {
    const app = telegram();
    app?.ready();
    app?.expand();

    const initData = app?.initData;
    if (!initData) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/telegram/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const data = (await res.json()) as { user?: PublicUser };
        if (!cancelled && res.ok && data.user) {
          setUser(data.user);
        } else if (!cancelled) {
          setAuthError(true);
        }
      } catch {
        if (!cancelled) setAuthError(true);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeSheet = () => setSheet(null);

  const handleProtectedAction = () => {
    haptic("impact");
    if (requiresActivation(user)) {
      setSheet({ type: "activation" });
      return;
    }
    setSheet({ type: "soon" });
  };

  return (
    <div className={styles.page}>
      <Header user={user} onProfileClick={() => setView("profile")} />

      {authError && (
        <div role="status" aria-live="polite" className={styles.authNotice}>
          Не удалось загрузить данные. Попробуйте обновить страницу.
        </div>
      )}

      <main className={styles.main}>
        {view === "home" && (
          <>
            <div className={styles.banner}>
              <Image
                src="/baner.png"
                alt="PlaceLove"
                width={2000}
                height={700}
                className={styles.bannerImage}
                priority
              />
            </div>

            <h1 className={styles.heading}>Активные задания</h1>

            <p className={styles.subheading}>
              Не более 5 заданий в день
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

            <HowItWorks />
          </>
        )}

        {view === "history" && (
          <History
            items={getHistoryItems()}
            onGoHome={() => setView("home")}
          />
        )}

        {view === "profile" && <Profile user={user} />}

        {authLoading && view === "home" && (
          <p className={styles.loadingHint}>Загружаем ваш аккаунт…</p>
        )}
      </main>

      <BottomNav view={view} onChange={setView} />

      <ActivationSheet
        open={sheet?.type === "activation"}
        onClose={closeSheet}
      />

      <BottomSheet
        open={sheet?.type === "soon"}
        onClose={closeSheet}
        title="Задание"
      >
        <p className={styles.soonText}>
          Скоро здесь появится выполнение задания.
        </p>
      </BottomSheet>
    </div>
  );
}
