"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu, type AccountMenuVariant } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { linkClassName } from "@/lib/links";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/audit", label: "Audit" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/products", label: "Products" },
  { href: "/playbook", label: "Playbook" },
  { href: "/style", label: "Style" },
  { href: "/export", label: "Export" },
] as const;

function navItemIsActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function NavLinks({
  pathname,
  className,
  profile,
  accountVariant,
}: {
  pathname: string;
  className?: string;
  profile: { name: string; imageSrc: string | null } | null;
  accountVariant: AccountMenuVariant;
}) {
  return (
    <ul className={className}>
      {NAV.map((item) => {
        const active = navItemIsActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={linkClassName(active ? "navActive" : "nav")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
      <AccountMenu
        profile={profile}
        pathname={pathname}
        variant={accountVariant}
      />
    </ul>
  );
}

export function DeskHeader({
  profile,
}: {
  profile?: { name: string; imageSrc: string | null } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openOnPath, setOpenOnPath] = useState(pathname);
  const menuId = useId();
  const chromeRef = useRef<HTMLDivElement>(null);
  const account = profile ?? null;

  if (openOnPath !== pathname) {
    setOpenOnPath(pathname);
    if (open) {
      setOpen(false);
    }
  }

  useEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) {
      return;
    }

    function publishHeight() {
      const node = chromeRef.current;
      if (!node) {
        return;
      }
      document.documentElement.style.setProperty(
        "--desk-header-height",
        `${node.getBoundingClientRect().height}px`,
      );
    }

    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(chrome);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--desk-header-height");
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onResize() {
      if (window.matchMedia("(min-width: 500px)").matches) {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-gray-200 bg-white">
      <div ref={chromeRef} className="mx-auto w-full max-w-[1400px] px-4">
        <div className="flex flex-col compact:gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-8 lg:gap-y-3 lg:py-4">
          <div className="flex min-h-12 items-center justify-between py-4 compact:justify-center lg:justify-start lg:py-0">
            <Link
              href="/"
              className="flex h-12 shrink-0 items-center overflow-visible"
              aria-label="Numan Usman Desk"
            >
              <Image
                src="/logos/nusman-logo-square.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 object-contain compact:hidden"
                priority
              />
              <Image
                src="/logos/nusman-logo-wide.png"
                alt=""
                width={252}
                height={48}
                className="hidden h-12 w-auto shrink-0 object-contain compact:block"
                priority
              />
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="compact:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((current) => !current)}
            >
              <MenuIcon open={open} />
            </Button>
          </div>

          <nav
            aria-label="Desk"
            className="hidden min-w-0 w-full compact:block lg:flex-1"
          >
            <NavLinks
              pathname={pathname}
              profile={account}
              accountVariant="panel"
              className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 pb-4 lg:justify-end lg:gap-x-6 lg:pb-0"
            />
          </nav>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-gray-200 bg-white compact:hidden"
        >
          <nav aria-label="Desk" className="mx-auto max-w-[1400px] px-4 py-4">
            <NavLinks
              pathname={pathname}
              profile={account}
              accountVariant="menu"
              className="flex flex-col gap-3"
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
