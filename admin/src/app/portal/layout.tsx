import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal · Numan Usman",
  description:
    "Client portal for progress, discovery, schedule, and messages with the nusman.dev practice.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
