"use client";

import { useLang } from "@/lib/i18n";

const L = {
  fr: ["Requête", "Host", "Tenant", "org_id", "RLS Postgres", "Jeton ES256 scopé à l'organisation"],
  en: ["Request", "Host", "Tenant", "org_id", "Postgres RLS", "ES256 token scoped to the organisation"],
};

export function TenantDiagram() {
  const { lang } = useLang();
  const [req, host, tenant, org, rls, token] = L[lang];
  const boxes = [req, host, tenant, org, rls];
  return (
    <svg className="diagram" viewBox="0 0 720 150" role="img" aria-label={`${req} → ${host} → ${tenant} → ${org} → ${rls}`}>
      <defs>
        <marker id="arr" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="currentColor" />
        </marker>
      </defs>
      {boxes.map((label, i) => {
        const x = 10 + i * 142;
        return (
          <g key={label}>
            <rect x={x} y="40" width="120" height="44" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
            <text x={x + 60} y="67" textAnchor="middle" fontSize="11" fill="currentColor">{label}</text>
            {i < boxes.length - 1 && <line x1={x + 120} y1="62" x2={x + 142} y2="62" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#arr)" />}
          </g>
        );
      })}
      <line x1="354" y1="84" x2="354" y2="112" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 3" />
      <text x="354" y="130" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.7">{token}</text>
    </svg>
  );
}
