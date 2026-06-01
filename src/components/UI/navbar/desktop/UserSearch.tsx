"use client";

import { useRef, useState, useEffect } from "react";
import { FiSearch, FiX, FiUser, FiStar } from "react-icons/fi";
import { DropdownMenu } from "@/components/DropdownMenu";
import Image from "next/image";
import type { Role } from "@/types/user";

interface SearchUser {
  id: string;
  username: string | null;
  fullname: string | null;
  avatar: string | null;
  role: Role;
  gamifications: {
    xp: number;
    level: number;
  } | null;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        const users: SearchUser[] = json.data?.users ?? [];
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <FiSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuarios..."
          className="w-full rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 pl-9 pr-8 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition hover:border-primary/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/70 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      <DropdownMenu
        isOpen={open}
        onClose={handleClose}
        anchorRef={containerRef}
        align="left"
        offset={4}
        className="w-full max-w-md"
      >
        {loading ? (
          <div className="space-y-2 px-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="size-10 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-white/40">
            Ningún usuario encontrado
          </div>
        ) : (
          <ul className="py-2">
            {results.map((user) => (
              <li key={user.id}>
                <div
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-default"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Avatar de ${user.fullname ?? user.username ?? ""}`}
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover border border-gray-200 dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                      <FiUser className="text-gray-400 dark:text-white/40" size={16} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.fullname ?? user.username ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/40 truncate">
                      @{user.username ?? "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {user.gamifications ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <FiStar size={12} className="fill-current" />
                        Nv.{user.gamifications.level} · {user.gamifications.xp.toLocaleString()} XP
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-white/40 whitespace-nowrap">
                        Nv.1
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenu>
    </div>
  );
}
