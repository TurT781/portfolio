"use client";

import Image from "next/image";
import Link from "next/link";
import { koopadex } from "@/lib/content/koopadex";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";
import { Brand } from "@/components/ui/Brand";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Stats } from "@/components/ui/Stats";
import { TenantDiagram } from "@/components/koopadex/TenantDiagram";
import { FiscalDiagram } from "@/components/koopadex/FiscalDiagram";

export function CaseStudy() {
  const t = useT();
  return (
    <>
      <Brand />
      <nav className="pill" aria-label="Navigation">
        <Link href="/">{"<- "}{t(ui.nav.home)}</Link>
        <span className="sep" aria-hidden="true" />
        <LanguageToggle />
      </nav>

      <main className="case">
        <header className="case-head">
          <Image src="/foil-card.png" alt="" width={360} height={420} priority className="case-orn" />
          <p className="kicker">{t(koopadex.kicker)}</p>
          <h1 className="t-display t-h1">{t(koopadex.title)}</h1>
          <p className="t-body">{t(koopadex.lede)}</p>
          <Stats items={koopadex.stats} />
        </header>

        {koopadex.sections.map((s, i) => (
          <section key={s.id} id={s.id} className="case-sec" aria-labelledby={`${s.id}-t`}>
            <p className="kicker">{String(i + 1).padStart(2, "0")}</p>
            <h2 id={`${s.id}-t`} className="t-display t-h2">{t(s.title)}</h2>
            {s.paragraphs.map((p, j) => <p key={j} className="t-body">{t(p)}</p>)}
            {s.id === "multitenant" && <TenantDiagram />}
            {s.id === "fiscal" && <FiscalDiagram />}
            {s.id === "captures" && koopadex.captures.length > 0 && (
              <div className="captures">
                {koopadex.captures.map((c) => (
                  <figure key={c.src}>
                    <Image src={c.src} alt={t(c.caption)} width={c.width} height={c.height} sizes="(max-width: 900px) 100vw, 900px" />
                    <figcaption className="t-meta">{t(c.caption)}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        ))}

        <footer className="case-foot t-meta">
          <span>© 2026 Flavien Patriarca</span>
          <Link href="/#contact">{t(ui.nav.contact)} {"->"}</Link>
        </footer>
      </main>
    </>
  );
}
