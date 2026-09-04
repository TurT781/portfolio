/**
 * Géométrie du voyage. Fonctions pures, sans three.js, sans DOM :
 * c'est ce qui se teste, le reste (scene.ts) ne fait que les appliquer.
 */
export const GAP = 14;          // unités entre deux étapes
export const CAM_AHEAD = 6.2;   // distance caméra → objet quand l'étape est « en face »
export const STATIONS = 5;
export const END = GAP * (STATIONS - 1);
export const FADE = 5.2;        // distance à laquelle le texte d'une étape est éteint
export const SMOOTH = 5.5;      // raideur du lissage temporel

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function stationZ(i: number): number {
  return i === 0 ? 0 : -i * GAP;
}

export function progressToZ(p: number): number {
  return CAM_AHEAD - clamp01(p) * END;
}

export function stationProgress(i: number): number {
  return i / (STATIONS - 1);
}

/** 0 = en face ; > 0 pas encore atteinte ; < 0 dépassée. */
export function stationDistance(camZ: number, i: number): number {
  return camZ - (stationZ(i) + CAM_AHEAD);
}

export function stationVisibility(camZ: number, i: number): number {
  return 1 - Math.min(1, Math.abs(stationDistance(camZ, i)) / FADE);
}

export function activeStation(camZ: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < STATIONS; i++) {
    const d = Math.abs(stationDistance(camZ, i));
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Lissage exponentiel en temps réel : une machine lente arrive quand même. */
export function smooth(current: number, target: number, dt: number, k: number = SMOOTH): number {
  return current + (target - current) * (1 - Math.exp(-dt * k));
}
