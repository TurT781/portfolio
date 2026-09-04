"use client";

import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

type Props = { onWork: () => void; onContact: () => void };

export function Pill({ onWork, onContact }: Props) {
  const t = useT();
  return (
    <nav className="pill" aria-label={t(ui.nav.label)}>
      <button type="button" onClick={onWork}>{t(ui.nav.work)}</button>
      <span className="sep" aria-hidden="true" />
      <button type="button" onClick={onContact}>{t(ui.nav.contact)}</button>
      <span className="sep" aria-hidden="true" />
      <LanguageToggle />
    </nav>
  );
}
