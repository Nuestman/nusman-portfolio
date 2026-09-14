"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
] as const;

export function DeskHeader({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/nusman-logo-wide.png"
              alt="Numan Usman"
              width={160}
              height={40}
              className="h-10 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="font-heading text-2xl text-gold-500">Desk</span>
          </Link>
          <nav className="flex items-center gap-4">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    active
                      ? "text-gold-500"
                      : "text-dark-950 hover:text-gold-500",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email ? (
            <p className="hidden text-sm text-gray-500 sm:block">{email}</p>
          ) : null}
          <form action={logout}>
            <Button variant="secondary" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
