"use client";

import type { I18nString } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export type ArrowLink = { label: I18nString; href: string; external?: boolean };

export function Arrows({ links, className = "" }: { links: ArrowLink[]; className?: string }) {
  const t = useT();
  return (
    <div className={`arrows ${className}`}>
      {links.map((l) => (
        <a key={l.href + l.label.fr} href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noreferrer" : undefined}>
          {t(l.label)}
        </a>
      ))}
    </div>
  );
}
