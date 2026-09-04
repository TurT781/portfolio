"use client";

import { useState } from "react";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

type Status = "idle" | "sending" | "success" | "error";
const EMAIL = "flavien.patriarca2002@gmail.com";

export function ContactForm() {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setStatus("success"); formEl.reset(); return; }
      const data = await res.json().catch(() => ({}));
      if (data?.error === "not_configured") {
        // Pas de clé Resend : on ouvre le client mail du visiteur avec le message prérempli.
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Contact de ${payload.name}`)}&body=${encodeURIComponent(payload.message)}`;
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="cform" onSubmit={onSubmit}>
      <div className="row">
        <label>
          <span>{t(ui.contact.name)}</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label>
          <span>{t(ui.contact.email)}</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label>
        <span>{t(ui.contact.message)}</span>
        <textarea name="message" required minLength={5} maxLength={5000} rows={3} />
      </label>
      <div className="row send">
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? t(ui.contact.sending) : `${t(ui.contact.send)} ->`}
        </button>
        <span role="status" aria-live="polite">
          {status === "success" && <span className="ok">{t(ui.contact.success)}</span>}
          {status === "error" && <span className="ko">{t(ui.contact.error)}</span>}
        </span>
      </div>
    </form>
  );
}
