"use client";

import { useLang } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <span className="flex items-center gap-2">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`u-mono text-[9px] tracking-[0.22em] transition-colors ${lang === l ? "text-ice" : "text-dim hover:text-text"}`}
        >
          {l}
        </button>
      ))}
    </span>
  );
}
