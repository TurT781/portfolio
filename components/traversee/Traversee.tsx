"use client";

import { useCallback, useState, type ReactNode } from "react";
import { stationProgress } from "@/components/traversee/camera";
import { Rail } from "@/components/traversee/Rail";
import { Brand } from "@/components/ui/Brand";
import { Pill } from "@/components/ui/Pill";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Traversee({ children, scene }: { children: ReactNode; scene?: ReactNode }) {
  const t = useT();
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: stationProgress(i) * max, behavior: reduced ? "auto" : "smooth" });
  }, []);

  return (
    <>
      {scene}
      <div className="grain" aria-hidden="true" />
      <div className="track" aria-hidden="true" />
      <Brand />
      <Pill onWork={() => goTo(1)} onContact={() => goTo(4)} />
      <Rail active={active} goTo={goTo} />
      <main>{children}</main>
      <div className={`hint u-mono ${active === 0 ? "" : "off"}`} aria-hidden="true">{t(ui.nav.scroll)} ↓</div>
      {/* setActive est branché par <Scene/> à la tâche 7 via l'événement ci-dessous */}
      <ActiveListener onChange={setActive} />
    </>
  );
}

/** Reçoit `traversee:active` (CustomEvent<number>) émis par la scène. */
function ActiveListener({ onChange }: { onChange: (i: number) => void }) {
  if (typeof window !== "undefined") {
    window.__traverseeOnActive = onChange;
  }
  return null;
}

declare global {
  interface Window { __traverseeOnActive?: (i: number) => void }
}
