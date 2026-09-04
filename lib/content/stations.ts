import type { I18nString } from "@/lib/content/ui";

export type Side = "left" | "right";

export type Station = {
  id: "accueil" | "koopadex" | "parcours" | "competences" | "contact";
  side: Side;
  /** libellé court du rail */
  label: I18nString;
  kicker: I18nString;
  title: I18nString;
  body?: I18nString;
  /** lignes en mono capitales */
  meta?: I18nString[];
  stats?: { value: string; label: I18nString }[];
  links?: { label: I18nString; href: string; external?: boolean }[];
};

export const stations: Station[] = [
  {
    id: "accueil",
    side: "left",
    label: { fr: "Accueil", en: "Home" },
    kicker: { fr: "Développeur full-stack · Lyon", en: "Full-stack developer · Lyon" },
    title: { fr: "Je construis des systèmes qui tiennent.", en: "I build systems that hold." },
    meta: [
      { fr: "Caisse certifiée NF525 · SaaS multi-tenant · Automatisations data", en: "NF525-certified POS · Multi-tenant SaaS · Data automation" },
    ],
    links: [
      { label: { fr: "CV (FR)", en: "CV (FR)" }, href: "/pdf/FR_CV_FLAVIEN_PATRIARCA.pdf", external: true },
      { label: { fr: "Resume (EN)", en: "Resume (EN)" }, href: "/pdf/EN_Resume_PATRIARCA_Flavien.pdf", external: true },
    ],
  },
  {
    id: "koopadex",
    side: "right",
    label: { fr: "Koopadex", en: "Koopadex" },
    kicker: { fr: "01 — Œuvre principale · 2025 →", en: "01 — Main work · 2025 →" },
    title: { fr: "Koopadex", en: "Koopadex" },
    body: {
      fr: "Back-office SaaS multi-boutiques pour l'achat-revente de cartes à collectionner. Une installation, plusieurs enseignes isolées en base par RLS. La caisse encaisse pour de vrai, tous les jours, dans une boutique physique.",
      en: "Multi-store SaaS back office for buying and selling trading cards. One installation, several shops isolated at the database level by RLS. The register takes real payments, every day, in a physical shop.",
    },
    stats: [
      { value: "30", label: { fr: "Pages", en: "Pages" } },
      { value: "84", label: { fr: "Routes d'API", en: "API routes" } },
      { value: "NF525", label: { fr: "Certifiée", en: "Certified" } },
    ],
    links: [{ label: { fr: "Lire le case study", en: "Read the case study" }, href: "/koopadex" }],
  },
  {
    id: "parcours",
    side: "left",
    label: { fr: "Parcours", en: "Path" },
    kicker: { fr: "02 — Parcours", en: "02 — Path" },
    title: { fr: "Quatre étapes, une direction.", en: "Four steps, one direction." },
    meta: [
      { fr: "Masaï — développeur en alternance · depuis mai 2025", en: "Masaï — software developer, apprenticeship · since May 2025" },
      { fr: "Epitech — assistant région · janvier 2025", en: "Epitech — regional assistant · January 2025" },
      { fr: "Alice & Jules — stage, CMS Strapi · mars – mai 2024", en: "Alice & Jules — internship, Strapi CMS · March – May 2024" },
      { fr: "ACAVIRT — stage, Villeurbanne · 2023", en: "ACAVIRT — internship, Villeurbanne · 2023" },
    ],
  },
  {
    id: "competences",
    side: "right",
    label: { fr: "Compétences", en: "Skills" },
    kicker: { fr: "03 — Compétences", en: "03 — Skills" },
    title: { fr: "Ce avec quoi je construis.", en: "What I build with." },
    meta: [
      { fr: "TypeScript · Python · C# · Java · PHP", en: "TypeScript · Python · C# · Java · PHP" },
      { fr: "Next.js · React · React Native · Symfony", en: "Next.js · React · React Native · Symfony" },
      { fr: "PostgreSQL · Supabase · RLS · Docker · CI/CD", en: "PostgreSQL · Supabase · RLS · Docker · CI/CD" },
      { fr: "Workflows agentiques · Prompt engineering", en: "Agentic workflows · Prompt engineering" },
    ],
  },
  {
    id: "contact",
    side: "left",
    label: { fr: "Contact", en: "Contact" },
    kicker: { fr: "04 — Contact", en: "04 — Contact" },
    title: { fr: "Un projet, une opportunité, ou juste discuter.", en: "A project, an opportunity, or just a chat." },
    links: [
      { label: { fr: "GitHub", en: "GitHub" }, href: "https://github.com/TurT781", external: true },
      { label: { fr: "LinkedIn", en: "LinkedIn" }, href: "https://www.linkedin.com/in/flavien-patriarca-633010255/", external: true },
      { label: { fr: "Email direct", en: "Direct email" }, href: "mailto:flavien.patriarca2002@gmail.com" },
    ],
  },
];
