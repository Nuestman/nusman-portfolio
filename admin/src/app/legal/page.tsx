import Link from "next/link";
import { listLegalDocuments } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { requireSessionUser } from "@/lib/current-user";
import { linkClassName } from "@/lib/links";

export const dynamic = "force-dynamic";

export default async function LegalListPage() {
  await requireSessionUser();
  const docs = await listLegalDocuments();

  return (
    <DeskShell>
      <div className="mb-8">
        <h1 className="section-heading">Legal</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Privacy and Terms published to nusman.dev. Edits go live on the next
          public fetch (static fallback remains in the site repo).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Last updated</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.slug} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-dark-950">
                  {doc.title}
                </td>
                <td className="px-4 py-3 text-gray-700">{doc.lastUpdated}</td>
                <td className="px-4 py-3 text-gray-500">{doc.slug}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/legal/${doc.slug}/edit`}
                    className={linkClassName("table")}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No legal documents yet. Run migration 0021.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DeskShell>
  );
}
