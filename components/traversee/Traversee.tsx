"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { stationProgress } from "@/components/traversee/camera";
import { Rail } from "@/components/traversee/Rail";
import { Scene } from "@/components/traversee/Scene";
import { Brand } from "@/components/ui/Brand";
import { Pill } from "@/components/ui/Pill";
import { stations } from "@/lib/content/stations";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Traversee({ children }: { children: ReactNode }) {
  const t = useT();
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.documentElement.classList.contains("no-gl")) {
      document.getElementById(stations[i].id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: stationProgress(i) * max, behavior: reduced ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    const i = stations.findIndex((s) => s.id === window.location.hash.slice(1));
    if (i > 0) goTo(i);
  }, [goTo]);

  return (
    <>
      <Scene onActive={setActive} />
      <div className="grain" aria-hidden="true" />
      <div className="track" aria-hidden="true" />
      <Brand />
      <Pill onWork={() => goTo(1)} onContact={() => goTo(4)} />
      <Rail active={active} goTo={goTo} />
      <main>{children}</main>
      <div className={`hint u-mono ${active === 0 ? "" : "off"}`} aria-hidden="true">{t(ui.nav.scroll)} ↓</div>
    </>
  );
}
