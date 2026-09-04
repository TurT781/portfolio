"use client";

import Link from "next/link";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";
import { Brand } from "@/components/ui/Brand";

export default function NotFound() {
  const t = useT();
  return (
    <>
      <Brand />
      <main className="case" style={{ paddingTop: 200 }}>
        <p className="kicker">404</p>
        <h1 className="t-display t-h1">{t(ui.notFound.title)}</h1>
        <div className="arrows"><Link href="/">{t(ui.notFound.back)}</Link></div>
      </main>
    </>
  );
}
