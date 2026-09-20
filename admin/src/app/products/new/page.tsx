import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkClassName } from "@/lib/links";
import { NewProductForm } from "../new-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const email = await getSessionEmail();

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link href="/products" className={linkClassName("back")}>
              ← Products
            </Link>
            <h1 className="mt-3 section-heading">Add product</h1>
            <p className="mt-2 text-gray-700">
              A record on Desk. Do not point this at another product’s database.
            </p>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
          </CardHeader>
          <CardContent>
            <NewProductForm />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
