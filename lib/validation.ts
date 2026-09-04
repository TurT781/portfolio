export type ContactInput = { name: string; email: string; message: string };

type Result =
  | { ok: true; value: ContactInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(data: unknown): Result {
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "Invalid payload" };
  }
  const d = data as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name.trim() : "";
  const email = typeof d.email === "string" ? d.email.trim() : "";
  const message = typeof d.message === "string" ? d.message.trim() : "";

  if (name.length < 2 || name.length > 100) return { ok: false, error: "Invalid name" };
  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, error: "Invalid email" };
  if (message.length < 5 || message.length > 5000) return { ok: false, error: "Invalid message" };

  return { ok: true, value: { name, email, message } };
}
