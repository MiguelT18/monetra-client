import { ReactNode } from "react";

export function RoleLayoutOverlay({ children }: { children?: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* Role-tinted ambient wash — static, adapted to the current role palette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 12% 8%, color-mix(in srgb, var(--role-accent) 14%, transparent) 0%, transparent 65%),
            radial-gradient(ellipse 45% 50% at 90% 12%, color-mix(in srgb, var(--role-accent) 11%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 50% 105%, color-mix(in srgb, var(--role-accent) 9%, transparent) 0%, transparent 60%)
          `,
        }}
      />
      {children}
    </div>
  );
}
