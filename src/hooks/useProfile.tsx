import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types/user";

interface UseProfileReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

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
        console.error("[useProfile error]:", err);
        setError("Error al obtener el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { user, loading, error, refetch };
}
