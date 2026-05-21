import { AuthCard } from "@/components/auth/auth-ui";

export default function OAuthCallbackLoading() {
  return (
    <AuthCard
      title="Completando acceso"
      subtitle="Estamos verificando tu cuenta…"
    >
      <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
    </AuthCard>
  );
}
