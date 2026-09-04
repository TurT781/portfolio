import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateContact } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No key configured: tell the client to fall back to mailto.
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { name, email, message } = result.value;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["flavien.patriarca2002@gmail.com"],
      replyTo: email,
      subject: `Portfolio — message de ${name}`,
      text: `De: ${name} <${email}>\n\n${message}`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}
