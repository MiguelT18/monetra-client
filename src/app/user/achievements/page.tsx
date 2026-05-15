"use client";

import { RoleBadge, UserPageHeader } from "@/components/user/userShell";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";

export default function AchievementsPage() {
  const { user } = useProfile();

  return (
    <main className="p-10">
      <UserPageHeader
        title="Logros"
        description="Aquí puedes ver tus logros y recompensas."
        badge={<RoleBadge label="Estudiante" tone="blue" />}
      />
    </main>
  );
}
