import { NextResponse } from "next/server";
import { getPerson } from "@/db/queries";
import { fetchPrivateBlob, isVercelBlobUrl } from "@/lib/blob-storage";
import { getPortalSessionPerson } from "@/lib/current-person";
import { getSessionUser } from "@/lib/current-user";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return new NextResponse(null, { status: 404 });
  }

  const person = await getPerson(id);
  if (!person || !isVercelBlobUrl(person.imageUrl)) {
    return new NextResponse(null, { status: 404 });
  }

  const deskUser = await getSessionUser();
  if (!deskUser) {
    const portal = await getPortalSessionPerson();
    if (!portal || portal.person.id !== person.id) {
      return new NextResponse(null, { status: 401 });
    }
  }

  const blob = await fetchPrivateBlob(person.imageUrl!);
  if (!blob) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.contentType,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
