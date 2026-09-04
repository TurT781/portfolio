"use client";

import { useLang } from "@/lib/i18n";

const L = {
  fr: ["Vente", "Forme canonique + hash", "HMAC chaîné (prev_hash)", "Clôture Z", "/api/pos/fiscal/verify"],
  en: ["Sale", "Canonical form + hash", "Chained HMAC (prev_hash)", "Z closure", "/api/pos/fiscal/verify"],
};

export function FiscalDiagram() {
  const { lang } = useLang();
  const boxes = L[lang];
  return (
    <svg className="diagram" viewBox="0 0 720 150" role="img" aria-label={boxes.join(" → ")}>
      <defs>
        <marker id="arr2" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="currentColor" />
        </marker>
      </defs>
      {boxes.slice(0, 4).map((label, i) => {
        const x = 10 + i * 178;
        return (
          <g key={label}>
            <rect x={x} y="40" width="156" height="44" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
            <text x={x + 78} y="67" textAnchor="middle" fontSize="10.5" fill="currentColor">{label}</text>
            {i < 3 && <line x1={x + 156} y1="62" x2={x + 178} y2="62" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#arr2)" />}
          </g>
        );
      })}
      <path d="M 88 84 C 88 130, 632 130, 632 84" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 3" />
      <text x="360" y="128" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.7">{boxes[4]}</text>
    </svg>
  );
}
