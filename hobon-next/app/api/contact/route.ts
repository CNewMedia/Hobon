import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { sendContactEmail } from "@/lib/contact/send-mail";
import { validateContactPayload } from "@/lib/contact/validate";

export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const data = validated.data;

  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  if (!checkRateLimit(clientIp(request))) {
    return NextResponse.json(
      { error: "Te veel aanvragen. Probeer het over enkele minuten opnieuw." },
      { status: 429 },
    );
  }

  try {
    await sendContactEmail(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] mail send failed", err);
    return NextResponse.json(
      { error: "Verzenden mislukt. Probeer het later opnieuw of mail ons rechtstreeks." },
      { status: 500 },
    );
  }
}
