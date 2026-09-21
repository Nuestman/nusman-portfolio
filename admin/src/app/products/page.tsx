import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listProductProjects } from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { Card, CardContent } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { gateGuide } from "@/lib/gates";
import { projectStatusLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { tableClassName, TableFrame, inactiveRowProps } from "@/lib/tables";
import { InactiveBadge } from "@/components/inactive-badge";
import { KNOWN_PRODUCTS } from "@/lib/products";
import { deleteProjectAction } from "@/app/projects/actions";
import { RecordKnownProducts } from "./record-known";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const email = await getSessionEmail();
  const loaded = await loadFromDb(() => listProductProjects());
  const recorded =
    loaded.kind === "ok"
      ? new Set(loaded.data.map((row) => row.title.toLowerCase()))
      : new Set<string>();
  const missingKnown = KNOWN_PRODUCTS.filter(
    (item) => !recorded.has(item.title.toLowerCase()),
  );

  return (
    <DeskShell email={email}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="section-heading">Products</h1>
            <p className="mt-2 max-w-2xl text-gray-700">
              Your own apps as Desk records. The live databases stay where they
              are until a later import.
            </p>
          </div>
          <Link href="/products/new" className={buttonClassName()}>
            Add product
          </Link>
        </div>

        {loaded.kind === "missing" || loaded.kind === "error" ? (
          <DatabaseNotice kind={loaded.kind} noun="products" />
        ) : (
          <>
            {missingKnown.length > 0 ? (
              <Card>
                <CardContent className="space-y-3 pt-6 text-gray-700">
                  <p>
                    {missingKnown.length} known{" "}
                    {missingKnown.length === 1 ? "product is" : "products are"}{" "}
                    not on Desk yet:{" "}
                    {missingKnown.map((item) => item.title).join(", ")}.
                  </p>
                  <RecordKnownProducts />
                </CardContent>
              </Card>
            ) : null}

            {loaded.data.length === 0 ? (
              <Card>
                <CardContent className="pt-6 space-y-4 text-gray-700">
                  <p>No products recorded yet.</p>
                  <Link href="/products/new" className={buttonClassName()}>
                    Add product
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <TableFrame>
                <table className={tableClassName}>
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Gate</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <TableActionsHeader />
                    </tr>
                  </thead>
                  <tbody>
                    {loaded.data.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-gray-100"
                        {...inactiveRowProps(product.status === "inactive")}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex flex-wrap items-center gap-2">
                            <Link
                              href={`/projects/${product.id}`}
                              className={linkClassName("table")}
                            >
                              {product.title}
                            </Link>
                            {product.status === "inactive" ? (
                              <InactiveBadge />
                            ) : null}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {gateGuide(product.currentGate).label}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {projectStatusLabel(product.status)}
                        </td>
                        <TableActionsCell>
                          <EditLink href={`/projects/${product.id}`} />
                          <form action={deleteProjectAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="next" value="/products" />
                            <ConfirmDelete
                              label="Remove"
                              confirmValue={product.title}
                              message={`Deletes “${product.title}” and everything on it. Type the title to confirm.`}
                            />
                          </form>
                        </TableActionsCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>
            )}
          </>
        )}
    </DeskShell>
  );
}
