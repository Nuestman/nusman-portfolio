import type { ReactNode } from "react";
import Link from "next/link";
import { linkClassName } from "@/lib/links";

export function TableActionsHeader() {
  return (
    <th className="px-4 py-3 font-medium text-right">
      <span className="sr-only">Actions</span>
    </th>
  );
}

export function TableActionsCell({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 py-3 text-right">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {children}
      </div>
    </td>
  );
}

export function EditLink({ href }: { href: string }) {
  return (
    <Link href={href} className={linkClassName("back")}>
      Edit
    </Link>
  );
}
