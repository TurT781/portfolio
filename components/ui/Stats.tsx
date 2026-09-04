"use client";

import type { I18nString } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Stats({ items }: { items: { value: string; label: I18nString }[] }) {
  const t = useT();
  return (
    <div className="stats">
      {items.map((s) => (
        <div key={s.value + s.label.fr}>
          <b>{s.value}</b>
          <span>{t(s.label)}</span>
        </div>
      ))}
    </div>
  );
}
