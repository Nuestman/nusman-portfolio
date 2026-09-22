import { NextResponse } from "next/server";
import { getUserById } from "@/db/queries";
import { fetchPrivateBlob, isVercelBlobUrl } from "@/lib/blob-storage";
import { getSessionUser } from "@/lib/current-user";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const viewer = await getSessionUser();
  if (!viewer) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return new NextResponse(null, { status: 404 });
  }

  const user = await getUserById(id);
  if (!user) {
    return new NextResponse(null, { status: 404 });
  }

  if (isVercelBlobUrl(user.imageUrl)) {
    const blob = await fetchPrivateBlob(user.imageUrl!);
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

  if (!user.imageData || !user.imageMime) {
    return new NextResponse(null, { status: 404 });
  }

  const body = Buffer.from(user.imageData, "base64");
  return new NextResponse(body, {
    headers: {
      "Content-Type": user.imageMime,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
