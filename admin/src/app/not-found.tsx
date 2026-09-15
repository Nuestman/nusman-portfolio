import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { DeskShell } from "@/components/desk-shell";
import { linkClassName } from "@/lib/links";

export default async function NotFound() {
  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
      <h1 className="section-heading">This page does not exist</h1>
      <p className="text-gray-700">That route is not on Desk.</p>
      <p>
        <Link href="/" className={linkClassName("back")}>
          ← Today
        </Link>
      </p>
    </DeskShell>
  );
}
