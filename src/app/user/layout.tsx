import { ReactNode } from "react";
import { UserLayoutClient } from "@/components/UserLayoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard del usuario",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
