import { describe, it, expect } from "vitest";
import { stations } from "@/lib/content/stations";

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
});
