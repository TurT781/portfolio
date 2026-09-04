"use client";

import { stations } from "@/lib/content/stations";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Rail({ active, goTo }: { active: number; goTo: (i: number) => void }) {
  const t = useT();
  return (
    <nav className="rail" aria-label={t(ui.nav.stages)}>
      {stations.map((s, i) => (
        <button key={s.id} type="button" data-go={i} className={i === active ? "on" : ""} aria-current={i === active ? "step" : undefined} onClick={() => goTo(i)}>
          {t(s.label)}
        </button>
      ))}
    </nav>
  );
}
