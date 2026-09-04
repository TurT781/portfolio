"use client";

import { useEffect, useRef } from "react";
import type { SceneHandle } from "@/components/traversee/foil-scene";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function fallbackToFlat() {
  document.documentElement.classList.add("no-gl");
  document.querySelectorAll<HTMLElement>(".station").forEach((el) => {
    el.removeAttribute("inert");
    el.classList.add("on");
  });
}

export function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasWebGL() || new URLSearchParams(location.search).has("nogl")) {
      fallbackToFlat();
      return;
    }

    let handle: SceneHandle | undefined;
    let cancelled = false;
    const stationEls = Array.from(document.querySelectorAll<HTMLElement>(".station"));
    const still = new URLSearchParams(location.search).has("still");
    if (still) document.documentElement.classList.add("still");

    // three.js n'est chargé qu'ici, après hydratation : le LCP reste du texte.
    import("@/components/traversee/foil-scene")
      .then(({ createScene }) => {
        if (cancelled) return;
        handle = createScene({
          canvas,
          stationEls,
          onActiveChange: (i) => window.__traverseeOnActive?.(i),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          mobile: window.innerWidth < 900,
          still,
        });
      })
      .catch(fallbackToFlat);

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return <canvas ref={ref} id="gl" aria-hidden="true" />;
}
