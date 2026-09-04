import { describe, it, expect } from "vitest";
import { validateContact } from "@/lib/validation";

describe("validateContact", () => {
  it("accepts a valid payload", () => {
    const r = validateContact({ name: "Flavien", email: "a@b.com", message: "Hello there" });
    expect(r.ok).toBe(true);
  });

  it("rejects a missing name", () => {
    const r = validateContact({ name: "", email: "a@b.com", message: "Hello there" });
    expect(r.ok).toBe(false);
  });

  it("rejects an invalid email", () => {
    const r = validateContact({ name: "Flavien", email: "not-an-email", message: "Hello there" });
    expect(r.ok).toBe(false);
  });

  it("rejects a too-short message", () => {
    const r = validateContact({ name: "Flavien", email: "a@b.com", message: "hi" });
    expect(r.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact("string").ok).toBe(false);
  });
});
