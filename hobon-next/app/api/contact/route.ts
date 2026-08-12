import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { sendContactEmail } from "@/lib/contact/send-mail";
import { validateContactPayload } from "@/lib/contact/validate";
import type { ContactErrorCode } from "@/lib/contact/error-codes";

export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function errorResponse(errorCode: ContactErrorCode, status: number) {
  return NextResponse.json({ errorCode }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_json", 400);
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return errorResponse(validated.errorCode, 400);
  }

  const data = validated.data;

  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  if (!checkRateLimit(clientIp(request))) {
    return errorResponse("rate_limit", 429);
  }

  try {
    await sendContactEmail(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] mail send failed", err);
    return errorResponse("send_failed", 500);
  }
}
