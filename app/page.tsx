import AppShell from "@/components/AppShell";

export default function HomePage() {
  // Авторизация происходит на клиенте через Telegram initData
  // (см. AppShell) — сервер рендерит только оболочку Mini App.
  return <AppShell />;
}
