import { AuthCard } from "@/components/auth/auth-ui";

export default function ResetPasswordLoading() {
  return (
    <AuthCard
      title="Restablecer contraseña"
      subtitle="Cargando…"
    >
      <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
    </AuthCard>
  );
}
