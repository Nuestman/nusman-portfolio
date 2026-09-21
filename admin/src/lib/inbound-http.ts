import { NextResponse, type NextRequest } from "next/server";

export function deskPublicBaseUrl(): string {
  const fromEnv = process.env.DESK_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  return "https://desk.nusman.dev";
}

export function allowedOrigins(): string[] {
  const fromEnv = process.env.INBOUND_ALLOWED_ORIGINS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter(Boolean);
  }
  if (process.env.NODE_ENV !== "production") {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "https://nusman.dev",
      "https://www.nusman.dev",
    ];
  }
  return ["https://nusman.dev", "https://www.nusman.dev"];
}

export function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  return headers;
}

export function originAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  if (process.env.NODE_ENV === "production") {
    return Boolean(origin && allowed.includes(origin));
  }
  if (!origin) {
    return true;
  }
  return allowed.includes(origin);
}

export function inboundJson(
  request: NextRequest,
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders(request),
  });
}

export function inboundOptions(request: NextRequest) {
  if (!originAllowed(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function asTrimmed(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

export function asOptional(value: unknown, max: number): string | null {
  const text = asTrimmed(value, max);
  return text || null;
}

export function oneLine(value: string, max = 160): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export const INBOUND_LIMITS = {
  name: 120,
  org: 160,
  problem: 2000,
  whoFor: 500,
  success: 2000,
  short: 200,
  sourceOther: 200,
} as const;
