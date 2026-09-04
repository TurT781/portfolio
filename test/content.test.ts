import { describe, it, expect } from "vitest";
import { stations } from "@/lib/content/stations";
import { koopadex } from "@/lib/content/koopadex";

describe("stations", () => {
  it("has exactly five stations with unique ids", () => {
    expect(stations).toHaveLength(5);
    expect(new Set(stations.map((s) => s.id)).size).toBe(5);
  });

  it("is bilingual everywhere", () => {
    for (const s of stations) {
      for (const field of [s.label, s.kicker, s.title]) {
        expect(field.fr.trim()).not.toBe("");
        expect(field.en.trim()).not.toBe("");
      }
      for (const m of s.meta ?? []) expect(m.fr && m.en).toBeTruthy();
      for (const l of s.links ?? []) expect(l.label.fr && l.label.en && l.href).toBeTruthy();
      for (const st of s.stats ?? []) expect(st.value && st.label.fr && st.label.en).toBeTruthy();
    }
  });

  it("puts contact last and the case study link on the Koopadex station", () => {
    expect(stations[4].id).toBe("contact");
    expect(stations[1].links?.some((l) => l.href === "/koopadex")).toBe(true);
  });

  it("keeps the station side order stable", () => {
    expect(stations.map((s) => s.side)).toEqual(["left", "right", "left", "right", "left"]);
  });
});

describe("koopadex case study", () => {
  it("never names the client nor real business figures", () => {
    const all = JSON.stringify(koopadex).toLowerCase();
    expect(all).not.toContain("shoptacarte");
    expect(all).not.toMatch(/\d+\s?(k€|€|euros?|eur)\b/i);
    expect(all).not.toMatch(/marge|chiffre d'affaires|turnover/);
  });
  it("keeps the section order stable", () => {
    expect(koopadex.sections.map((s) => s.id)).toEqual([
      "contexte", "probleme", "multitenant", "fiscal", "caisse", "chiffres", "stack", "appris", "captures",
    ]);
  });
  it("is bilingual in every section", () => {
    for (const s of koopadex.sections) {
      expect(s.title.fr && s.title.en).toBeTruthy();
      for (const p of s.paragraphs) expect(p.fr && p.en).toBeTruthy();
    }
  });
  it("lists captures with a caption each", () => {
    for (const c of koopadex.captures) expect(c.src.startsWith("/koopadex/") && c.caption.fr && c.caption.en).toBeTruthy();
  });
});
