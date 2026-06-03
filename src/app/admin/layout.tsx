import { ReactNode } from "react";
import { UserLayoutClient } from "@/components/UI/UserLayoutClient";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
