import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Odibee_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const odibee = Odibee_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-odibee",
});

export const metadata: Metadata = {
  title: "Desk · Numan Usman",
  description: "Private workbench for the nusman.dev practice.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${odibee.variable} h-full w-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full w-full min-w-0 bg-gray-50 font-sans text-dark-950"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
