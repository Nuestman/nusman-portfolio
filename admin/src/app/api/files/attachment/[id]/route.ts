import { NextResponse } from "next/server";
import {
  getAttachmentForDownload,
  getPortalProjectForPerson,
} from "@/db/queries";
import { fetchPrivateBlob } from "@/lib/blob-storage";
import { getSessionUser } from "@/lib/current-user";
import { getPortalSessionPerson } from "@/lib/current-person";
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

  const attachment = await getAttachmentForDownload(id);
  if (!attachment) {
    return new NextResponse(null, { status: 404 });
  }

  const deskUser = await getSessionUser();
  if (!deskUser) {
    const portal = await getPortalSessionPerson();
    if (!portal || portal.client.id !== attachment.clientId) {
      return new NextResponse(null, { status: 401 });
    }
    const project = await getPortalProjectForPerson(
      attachment.projectId,
      portal.client.id,
    );
    if (!project) {
      return new NextResponse(null, { status: 403 });
    }
  }

  const blob = await fetchPrivateBlob(
    attachment.blobPathname || attachment.blobUrl,
  );
  if (!blob) {
    return new NextResponse(null, { status: 404 });
  }

  const isImage = attachment.contentType.startsWith("image/");
  const disposition = isImage ? "inline" : "attachment";
  const safeName = attachment.originalFilename.replace(/"/g, "");

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": attachment.contentType || blob.contentType,
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
