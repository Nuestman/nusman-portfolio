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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${odibee.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gray-50 font-sans text-dark-950">
        {children}
      </body>
    </html>
  );
}
