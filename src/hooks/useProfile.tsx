"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserProfile, type Role } from "@/types/user";
import { ROLE_ROUTES } from "@/lib/user";

// mismo ROLE_ROUTES que en el middleware

export type ProfileUpdateInput = {
  bio?: string | null;
  avatar?: string | null;
  fullname?: string;
  username?: string;
  phone?: string | null;
};

interface ProfileContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  changeRole: (role: Role) => Promise<{ ok: boolean; message: string }>;
  updateProfile: (
    data: ProfileUpdateInput,
  ) => Promise<{ ok: boolean; message: string }>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/profile", {
          signal: controller.signal,
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.message);
          return;
        }
        setUser(result.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[ProfileContext error]:", err);
        setError("Error al obtener el perfil");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchProfile();

    return () => controller.abort();
  }, [trigger]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch("/api/auth/refresh-session", { method: "POST" });
      } catch {
        // Silently ignore — the middleware will handle expired tokens
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  const updateProfile = useCallback(async (data: ProfileUpdateInput) => {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return { ok: false, message: result.message ?? "No se pudo actualizar el perfil" };
    }

    const updated = result.data?.user;
    if (updated) {
      setUser((prev) => (prev ? { ...prev, ...updated } : updated));
    } else {
      setTrigger((t) => t + 1);
    }

    return { ok: true, message: result.message ?? "Perfil actualizado" };
  }, []);

  const changeRole = useCallback(
    async (role: Role) => {
      const res = await fetch("/api/auth/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const result = await res.json();

      if (!res.ok) return { ok: false, message: result.message };

      // actualizar el usuario en el contexto sin refetch completo
      setUser((prev) => (prev ? { ...prev, role } : prev));

      // redirigir si la ruta actual no está permitida para el nuevo rol
      const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
        pathname.startsWith(route),
      );

      if (matchedRoute && !ROLE_ROUTES[matchedRoute].includes(role)) {
        router.push("/user/dashboard");
      }

      return { ok: true, message: result.message };
    },
    [pathname, router],
  );

  return (
    <ProfileContext.Provider
      value={{ user, loading, error, refetch, changeRole, updateProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
