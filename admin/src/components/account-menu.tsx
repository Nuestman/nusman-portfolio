"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { UserAvatar } from "@/components/user-avatar";
import { linkClassName } from "@/lib/links";
import { cn } from "@/lib/utils";

export type AccountMenuVariant = "panel" | "menu";

type AccountIconKind = "profile" | "journal" | "signOut";

const ACCOUNT_LINKS = [
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/log", label: "Journal", icon: "journal" },
] as const;

function accountLinkIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AccountIcon({
  kind,
  size,
}: {
  kind: AccountIconKind;
  size: number;
}) {
  const shared = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: "shrink-0",
  };

  switch (kind) {
    case "profile":
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5 19.25c1.15-2.9 3.4-4.25 7-4.25s5.85 1.35 7 4.25" />
        </svg>
      );
    case "journal":
      return (
        <svg {...shared}>
          <path d="M5 4h11a2 2 0 0 1 2 2v14H8a3 3 0 0 0-3 3V4z" />
          <path d="M5 4a3 3 0 0 0-3 3v14" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      );
    case "signOut":
      return (
        <svg {...shared}>
          <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
          <path d="M3 12h11M11 8l4 4-4 4" />
        </svg>
      );
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-transform duration-300",
        open ? "rotate-180" : "",
      )}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

function itemClass(variant: AccountMenuVariant, active: boolean): string {
  switch (variant) {
    case "panel":
      return cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm",
        active
          ? "text-gold-500"
          : "text-dark-950 hover:bg-gray-50 hover:text-gold-600",
      );
    case "menu":
      return cn(
        "inline-flex items-center gap-2",
        linkClassName(active ? "navActive" : "nav"),
      );
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function signOutWrapClass(variant: AccountMenuVariant): string {
  switch (variant) {
    case "panel":
      return "mt-1 border-t border-gray-100 pt-1";
    case "menu":
      return "";
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function listClass(variant: AccountMenuVariant): string {
  switch (variant) {
    case "panel":
      return "absolute left-1/2 z-50 mt-2 w-52 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white py-2 shadow-sm lg:left-auto lg:right-0 lg:translate-x-0";
    case "menu":
      return "mt-3 flex flex-col gap-3";
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function iconSize(variant: AccountMenuVariant): number {
  switch (variant) {
    case "panel":
      return 16;
    case "menu":
      return 20;
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

export function AccountMenu({
  profile,
  pathname,
  variant,
  links = ACCOUNT_LINKS,
  logoutAction = logout,
}: {
  profile: { name: string; imageSrc: string | null } | null;
  pathname: string;
  variant: AccountMenuVariant;
  links?: ReadonlyArray<{
    href: string;
    label: string;
    icon: AccountIconKind;
  }>;
  logoutAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [openOnPath, setOpenOnPath] = useState(pathname);
  const menuId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const glyph = iconSize(variant);

  if (openOnPath !== pathname) {
    setOpenOnPath(pathname);
    if (open) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) {
    return (
      <li>
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "inline-flex items-center gap-2",
              linkClassName("nav"),
            )}
          >
            <AccountIcon kind="signOut" size={glyph} />
            Sign out
          </button>
        </form>
      </li>
    );
  }

  return (
    <li ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 py-1 pl-1 pr-2 text-gray-900 transition-colors duration-300 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
        aria-label="Account"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <UserAvatar name={profile.name} src={profile.imageSrc} size={32} />
        <Chevron open={open} />
      </button>
      {open ? (
        <ul id={menuId} className={listClass(variant)}>
          {links.map((item) => {
            const active = accountLinkIsActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={itemClass(variant, active)}>
                  <AccountIcon kind={item.icon} size={glyph} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className={signOutWrapClass(variant)}>
            <form action={logoutAction} className="w-full">
              <button type="submit" className={itemClass(variant, false)}>
                <AccountIcon kind="signOut" size={glyph} />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      ) : null}
    </li>
  );
}
