import type { ReactNode } from "react";

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
      {children}
    </p>
  );
}
