"use client";

import type { Station as StationData } from "@/lib/content/stations";
import { useT } from "@/lib/i18n";
import { Arrows } from "@/components/ui/Arrows";
import { Stats } from "@/components/ui/Stats";
import { ContactForm } from "@/components/contact/ContactForm";

export function Station({ station, index }: { station: StationData; index: number }) {
  const t = useT();
  const Title = index === 0 ? "h1" : "h2";
  return (
    <section
      className={`station ${station.side} ${index === 0 ? "on" : ""}`}
      data-st={index}
      id={station.id}
      inert={index !== 0}
      aria-labelledby={`${station.id}-title`}
    >
      <p className="kicker">{t(station.kicker)}</p>
      <Title id={`${station.id}-title`} className={`t-display ${index === 0 ? "t-h1" : "t-h2"}`}>
        {t(station.title)}
      </Title>
      {station.body && <p className="t-body">{t(station.body)}</p>}
      {station.meta && (
        <p className="t-meta">
          {station.meta.map((m, i) => (
            <span key={i}>{t(m)}<br /></span>
          ))}
        </p>
      )}
      {station.stats && <Stats items={station.stats} />}
      {station.id === "contact" && <ContactForm />}
      {station.links && <Arrows links={station.links} />}
    </section>
  );
}
