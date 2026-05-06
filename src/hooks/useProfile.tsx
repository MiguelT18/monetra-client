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
import { UserProfile } from "@/types/user";

// mismo ROLE_ROUTES que en el middleware
const ROLE_ROUTES: Record<string, string[]> = {
  "/user/courses": ["STUDENT"],
  "/user/publications": ["PRODUCER"],
  "/user/sales": ["PRODUCER", "AFFILIATE"],
  "/user/links": ["AFFILIATE"],
  "/user/stats": ["PRODUCER", "AFFILIATE"],
  "/user/community": ["STUDENT", "PRODUCER"],
  "/user/performance": ["PRODUCER"],
};

type Role = "STUDENT" | "PRODUCER" | "AFFILIATE";

interface ProfileContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  changeRole: (role: Role) => Promise<{ ok: boolean; message: string }>;
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
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/profile");
        const result = await res.json();
        if (!res.ok) {
          setError(result.message);
          return;
        }
        setUser(result.data);
      } catch (err) {
        console.error("[ProfileContext error]:", err);
        setError("Error al obtener el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

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
      value={{ user, loading, error, refetch, changeRole }}
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
