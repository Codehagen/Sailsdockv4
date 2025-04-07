import { AppLayout } from "@/components/app-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bedrifter | CRM",
  description: "Behandle alle bedriftene i ett sted",
};

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
