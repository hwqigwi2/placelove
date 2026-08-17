import { getSessionUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import {
  toPublicUser,
  type DbUser,
  type PublicUser,
} from "@/lib/types";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

interface InitialAuth {
  user: PublicUser | null;
  authUnavailable: boolean;
}

async function getInitialAuth(): Promise<InitialAuth> {
  let userId: string | null;

  try {
    userId =
      await getSessionUserId();
  } catch {
    return {
      user: null,
      authUnavailable: true,
    };
  }

  if (!userId) {
    return {
      user: null,
      authUnavailable: false,
    };
  }

  try {
    const {
      data,
      error,
    } = await getSupabaseAdmin()
      .from("users")
      .select()
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return {
        user: null,
        authUnavailable: true,
      };
    }

    if (!data) {
      return {
        user: null,
        authUnavailable: false,
      };
    }

    return {
      user: toPublicUser(
        data as DbUser,
      ),
      authUnavailable: false,
    };
  } catch {
    return {
      user: null,
      authUnavailable: true,
    };
  }
}

export default async function HomePage() {
  const {
    user,
    authUnavailable,
  } =
    await getInitialAuth();

  return (
    <AppShell
      initialUser={user}
      authUnavailable={
        authUnavailable
      }
    />
  );
}