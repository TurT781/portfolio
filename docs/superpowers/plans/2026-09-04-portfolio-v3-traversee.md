# Portfolio V3 « Traversée Foil » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire et déployer sur Vercel le portfolio V3 dans un nouveau dépôt `TurT781/portfolio` : une home qui est une scène three.js traversée au scroll (5 étapes en verre foil), une page `/koopadex` case study en HTML rapide, bilingue FR/EN, formulaire de contact Resend.

**Architecture:** Next.js 16 App Router. La home rend côté serveur le HTML des 5 étapes (overlays `position: fixed`) ; un composant client charge three.js en `import()` dynamique après hydratation et pilote la caméra depuis `scrollY` — la boucle écrit directement dans le DOM des étapes (opacité, transform, `inert`), React n'est prévenu que quand l'étape active change. Sans WebGL, une classe `no-gl` transforme les étapes en page verticale classique. `/koopadex` n'a aucun WebGL.

**Tech Stack:** Next.js 16.2.9 · React 19.2.4 · TypeScript 5 strict · Tailwind v4 (tokens `@theme`) · three.js 0.185.1 (vanilla, pas de R3F) · Resend · Vitest 4 · `next/font/google` (Martian Mono, Schibsted Grotesk) · GitHub CLI `gh` (connecté : TurT781) · Vercel.

**Spec:** `docs/superpowers/specs/2026-09-04-portfolio-v3-traversee-design.md` (copiée dans le nouveau dépôt à la tâche 1 ; le prototype qui fait foi est https://claude.ai/code/artifact/5dece589-eb16-4c23-9122-e2a6ca632568).

## Global Constraints

- Nouveau dépôt **`TurT781/portfolio`**, dossier local **`C:\Users\flavi\Desktop\code\portfolio`** (`/c/Users/flavi/Desktop/code/portfolio` en Git Bash). `MyPortfolio` n'est **jamais** modifié par ce plan (sauf : rien).
- Versions épinglées : `next 16.2.9`, `react 19.2.4`, `react-dom 19.2.4`, `three 0.185.1`, `@types/three 0.185.4`, `eslint-config-next 16.2.9`. Node 24.
- **Plomberie V2 reprise à l'identique** : `lib/i18n.tsx`, `lib/validation.ts`, `app/api/contact/route.ts`, `test/validation.test.ts`, configs (`tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`), `public/pdf/*`, `public/me.png`, `app/favicon.ico`, `.env.local.example`.
- Palette : `--ground #000000` · `--ice #a9e5ff` · `--text` blanc 92 % · `--dim` blanc 55 % · `--faint` blanc 34 % · `--hair` blanc 16 %. Foil magenta `#ff3cbe` / cyan `#28dcff` / or `#ffbe5a` **uniquement dans la matière 3D et les lumières**.
- Typo : **Martian Mono** (structure, capitales) + **Schibsted Grotesk** (lecture). Rien d'autre.
- **Interdits** : dégradé sur texte · glow `box-shadow` coloré sur cartes · Inter, Space Grotesk, Instrument Serif · emoji · icônes décoratives · détournement du scroll (pas de Lenis, pas de smooth-scroll maison) · couleur foil en aplat UI.
- Scroll : **la molette native pilote la caméra**, via `scrollY`. La page a une vraie hauteur (`640vh`).
- Accessibilité : tout le contenu est du HTML dans l'ordre de lecture ; canvas `aria-hidden` ; étapes inactives `inert` ; focus visible `--ice` 2 px décalé 4 px ; cibles ≥ 24 px.
- `prefers-reduced-motion` : pas de spin, pas de flottement, pas de bloom, lissage instantané, poussière réduite. `visibilitychange` : boucle en pause.
- Koopadex : **données fictives uniquement** dans les captures ; le client (Shoptacarte) **n'est jamais nommé** ; pas de marge, CA, URL ou e-mail client.
- Budgets : LCP `/` < 2,5 s (4G simulée) ; scène ≤ 200 kB gz ; Lighthouse `/` perf ≥ 85 desktop / ≥ 70 mobile, a11y ≥ 95 ; `/koopadex` perf ≥ 95.
- Chaque tâche se termine par `npm run lint`, `npm test` et `npm run build` verts avant commit. Messages de commit en anglais, style `feat:`/`fix:`/`docs:`/`chore:`, **sans ligne d'attribution**.

---

## File Structure

| Fichier | Responsabilité |
| --- | --- |
| `app/layout.tsx` | polices `next/font`, `LanguageProvider`, metadata, `<html>` noir |
| `app/page.tsx` | la traversée : rend les 5 `<Station>` dans `<Traversee>` (serveur) |
| `app/koopadex/page.tsx` | case study, HTML pur |
| `app/not-found.tsx` | 404 dans le même langage |
| `app/api/contact/route.ts` | repris V2 |
| `app/globals.css` | tokens `@theme`, base, classes `.station .rail .pill .arrows .stats .hint .grain .track`, mode `.no-gl`, mode `.still` |
| `lib/i18n.tsx`, `lib/validation.ts` | repris V2 |
| `lib/content/ui.ts` | `I18nString`, libellés de navigation et du formulaire |
| `lib/content/stations.ts` | les 5 étapes FR/EN (type `Station`) |
| `lib/content/koopadex.ts` | le case study FR/EN (sections, chiffres, stack, captures) |
| `components/traversee/camera.ts` | fonctions **pures** : géométrie du voyage, visibilité, étape active, lissage |
| `components/traversee/scene.ts` | three.js : renderer, environnement, matière foil, objets d'étape, lumières, poussière, bloom, boucle. Exporte `createScene` |
| `components/traversee/Scene.tsx` | client : détection WebGL, `import("./scene")`, montage/démontage, repli `no-gl` |
| `components/traversee/Traversee.tsx` | client : état `active`, `goTo(i)`, assemble Scene + chrome + étapes |
| `components/traversee/Station.tsx` | overlay HTML d'une étape (kicker, titre, corps, méta, stats, liens, formulaire pour `contact`) |
| `components/traversee/Rail.tsx` | rail de progression cliquable |
| `components/ui/Pill.tsx` | navigation en pilule (Travaux / Contact / FR-EN) |
| `components/ui/Brand.tsx` | nom en haut à gauche |
| `components/ui/Arrows.tsx` | liste de liens `->` |
| `components/ui/Stats.tsx` | chiffres + labels |
| `components/ui/LanguageToggle.tsx` | repris V2, reclassé |
| `components/contact/ContactForm.tsx` | formulaire, repris V2 sans `Section`, restylé |
| `components/koopadex/CaseStudy.tsx` | page case study (client, i18n) |
| `components/koopadex/TenantDiagram.tsx`, `FiscalDiagram.tsx` | schémas SVG inline |
| `test/validation.test.ts` | repris V2 |
| `test/camera.test.ts` | les fonctions pures |
| `test/content.test.ts` | intégrité du contenu bilingue |
| `public/koopadex/*.png` | captures anonymisées (tâche 13) |
| `public/foil-card.png` | rendu statique de la carte (tâche 9) |

---

### Task 1: Amorcer le nouveau dépôt depuis la plomberie V2

**Files:**
- Create: `/c/Users/flavi/Desktop/code/portfolio/` (tout le dossier)
- Copy from `/c/Users/flavi/Desktop/code/MyPortfolio/`: `lib/i18n.tsx`, `lib/validation.ts`, `app/api/contact/route.ts`, `app/favicon.ico`, `test/validation.test.ts`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.env.local.example`, `public/pdf/`, `public/me.png`, `docs/superpowers/specs/2026-09-04-portfolio-v3-traversee-design.md`, `docs/superpowers/plans/2026-09-04-portfolio-v3-traversee.md`
- Create: `package.json`, `.gitignore`, `eslint.config.mjs`, `AGENTS.md`, `CLAUDE.md`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `README.md`

**Interfaces:**
- Produces: un projet Next 16 qui `build`, avec `npm test` vert (test de validation V2), poussé sur `github.com/TurT781/portfolio`.

- [ ] **Step 1: Créer le dossier et copier la plomberie V2**

```bash
SRC=/c/Users/flavi/Desktop/code/MyPortfolio
DST=/c/Users/flavi/Desktop/code/portfolio
mkdir -p $DST/{app/api/contact,lib/content,components/{traversee,ui,contact,koopadex},test,public/{pdf,koopadex},docs/superpowers/{specs,plans}}
cp $SRC/lib/i18n.tsx $SRC/lib/validation.ts $DST/lib/
cp $SRC/app/api/contact/route.ts $DST/app/api/contact/
cp $SRC/app/favicon.ico $DST/app/
cp $SRC/test/validation.test.ts $DST/test/
cp $SRC/tsconfig.json $SRC/next.config.ts $SRC/postcss.config.mjs $SRC/vitest.config.ts $SRC/.env.local.example $DST/
cp $SRC/public/pdf/*.pdf $DST/public/pdf/
cp $SRC/public/me.png $DST/public/
cp $SRC/docs/superpowers/specs/2026-09-04-portfolio-v3-traversee-design.md $DST/docs/superpowers/specs/
cp $SRC/docs/superpowers/plans/2026-09-04-portfolio-v3-traversee.md $DST/docs/superpowers/plans/
ls -R $DST | head -40
```

- [ ] **Step 2: Écrire `package.json`**

```json
{
  "name": "portfolio",
  "version": "3.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "prebuild": "vitest run",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "resend": "^6.14.0",
    "three": "0.185.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/three": "0.185.4",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.9"
  }
}
```

`prebuild` fait tourner Vitest avant chaque `next build`, donc aussi sur Vercel : un test rouge bloque le déploiement.

- [ ] **Step 3: Écrire `.gitignore`, `eslint.config.mjs`, `AGENTS.md`, `CLAUDE.md`**

`.gitignore` :

```gitignore
/node_modules
/.next/
/out/
/build
/coverage
.DS_Store
*.pem
npm-debug.log*
.env*
!.env.local.example
.vercel
*.tsbuildinfo
next-env.d.ts
# outillage local, jamais dans l'app
/.playwright-mcp/
/.superpowers/
/.remember/
/ruvector.db
```

`eslint.config.mjs` :

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".remember/**", ".superpowers/**"]),
]);
```

`AGENTS.md` (identique à V2, il pointe la doc Next locale) :

```markdown
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
```

`CLAUDE.md` :

```markdown
@AGENTS.md
```

- [ ] **Step 4: Écrire `app/globals.css` minimal, `app/layout.tsx`, `app/page.tsx` de démarrage**

`app/globals.css` (sera complété à la tâche 2 ; ici juste de quoi builder) :

```css
@import "tailwindcss";

:root { color-scheme: dark; }
body { background: #000; color: rgba(255, 255, 255, 0.92); margin: 0; }
```

`app/layout.tsx` :

```tsx
import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flavien Patriarca",
  description: "Développeur full-stack · Lyon",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
```

`app/page.tsx` :

```tsx
export default function Home() {
  return <main style={{ padding: 40 }}>Portfolio V3 — amorçage</main>;
}
```

- [ ] **Step 5: Installer, tester, builder**

```bash
cd /c/Users/flavi/Desktop/code/portfolio
npm install
npm test
npm run lint
npm run build
```

Expected : `npm test` → 5 tests `validateContact` PASS ; `lint` sans erreur ; `build` termine avec `○ /` et `ƒ /api/contact`.

- [ ] **Step 6: `README.md` de départ**

````markdown
# Flavien Patriarca — Portfolio V3

Next.js 16 · TypeScript · three.js · Resend. Spec : `docs/superpowers/specs/2026-09-04-portfolio-v3-traversee-design.md`.

## Développement

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run build    # lance aussi les tests (prebuild)
```

Formulaire de contact : copier `.env.local.example` → `.env.local` et renseigner `RESEND_API_KEY`. Sans clé, le formulaire bascule sur `mailto:`.

© 2026 Flavien Patriarca
````

- [ ] **Step 7: Initialiser git, créer le dépôt GitHub, pousser**

```bash
cd /c/Users/flavi/Desktop/code/portfolio
git init -b main
git add -A
git commit -m "chore: bootstrap Portfolio V3 from V2 plumbing"
gh repo create TurT781/portfolio --public --source=. --remote=origin --push --description "Portfolio — Flavien Patriarca, développeur full-stack"
git remote -v
```

Expected : `origin  git@github.com:TurT781/portfolio.git` (ou `https://...`), la branche `main` poussée. Vérifier : `gh repo view TurT781/portfolio --web` ouvre la page.

---

### Task 2: Tokens, polices, base CSS et layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: variables CSS `--font-martian`, `--font-schibsted` ; tokens Tailwind `bg-ground text-ice text-dim text-faint border-hair font-mono font-body` ; classes globales `.kicker .hair .u-mono .u-body` ; focus visible.

- [ ] **Step 1: Polices dans `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Martian_Mono, Schibsted_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Flavien Patriarca",
  description:
    "Développeur full-stack à Lyon. Caisse certifiée NF525, SaaS multi-tenant, automatisations data.",
  openGraph: {
    title: "Flavien Patriarca — développeur full-stack",
    description: "Je construis des systèmes qui tiennent en production.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${martian.variable} ${schibsted.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: `app/globals.css` — tokens et base**

Remplacer tout le fichier :

```css
@import "tailwindcss";

@theme {
  --color-ground: #000000;
  --color-ice: #a9e5ff;
  --color-text: rgba(255, 255, 255, 0.92);
  --color-dim: rgba(255, 255, 255, 0.55);
  --color-faint: rgba(255, 255, 255, 0.34);
  --color-hair: rgba(255, 255, 255, 0.16);
  --font-mono: var(--font-martian), ui-monospace, "Cascadia Mono", Consolas, monospace;
  --font-body: var(--font-schibsted), ui-sans-serif, system-ui, sans-serif;
}

/* Un seul monde visuel, noir, quel que soit le thème du visiteur. */
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--color-ground); color: var(--color-text); }
body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
a { color: inherit; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
:focus-visible { outline: 2px solid var(--color-ice); outline-offset: 4px; }

/* Rôles typographiques */
.u-mono { font-family: var(--font-mono); text-transform: uppercase; }
.kicker { font-family: var(--font-mono); font-size: 8.5px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: var(--color-ice); margin: 0; }
.hair { border-color: var(--color-hair); }
.t-display { font-family: var(--font-mono); font-weight: 200; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1.12; text-wrap: balance; margin: 0; }
.t-body { font-size: 14.5px; font-weight: 300; line-height: 1.7; color: var(--color-dim); max-width: 62ch; }
.t-meta { font-family: var(--font-mono); font-size: 9px; font-weight: 300; letter-spacing: 0.16em; line-height: 2.2; text-transform: uppercase; color: var(--color-dim); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 3: Vérifier**

```bash
npm run lint && npm run build
```

Expected : build vert ; dans `.next/static/media` deux familles de polices (fichiers `*.woff2`).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: design tokens, fonts and base styles"
```

---

### Task 3: Contenu bilingue des étapes

**Files:**
- Create: `lib/content/ui.ts`
- Create: `lib/content/stations.ts`
- Test: `test/content.test.ts`

**Interfaces:**
- Produces: `type I18nString = { fr: string; en: string }` ; `type Station` ; `export const stations: Station[]` (5 entrées, ids `accueil | koopadex | parcours | competences | contact`) ; `export const ui` (nav, contact).

- [ ] **Step 1: Écrire le test**

`test/content.test.ts` :

```ts
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
```

- [ ] **Step 2: Lancer le test pour le voir échouer**

```bash
npx vitest run test/content.test.ts
```

Expected : FAIL — `Cannot find module '@/lib/content/stations'`.

- [ ] **Step 3: Écrire `lib/content/ui.ts`**

```ts
export type I18nString = { fr: string; en: string };

export const ui = {
  nav: {
    work: { fr: "Travaux", en: "Work" },
    contact: { fr: "Contact", en: "Contact" },
    home: { fr: "Accueil", en: "Home" },
    stages: { fr: "Étapes", en: "Stages" },
    scroll: { fr: "Scroll : avance", en: "Scroll to move" },
  },
  contact: {
    name: { fr: "Nom", en: "Name" },
    email: { fr: "Email", en: "Email" },
    message: { fr: "Message", en: "Message" },
    send: { fr: "Envoyer", en: "Send" },
    sending: { fr: "Envoi…", en: "Sending…" },
    success: { fr: "Message envoyé. Merci.", en: "Message sent. Thank you." },
    error: { fr: "Échec de l'envoi. Réessayez ou écrivez-moi directement.", en: "Send failed. Retry or email me directly." },
  },
  notFound: {
    title: { fr: "Cette page n'existe pas.", en: "This page does not exist." },
    back: { fr: "Retour à l'accueil", en: "Back home" },
  },
} as const;
```

- [ ] **Step 4: Écrire `lib/content/stations.ts`**

```ts
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
```

- [ ] **Step 5: Lancer les tests**

```bash
npm test
```

Expected : 8 tests PASS (5 validation + 3 content).

- [ ] **Step 6: Commit**

```bash
git add lib/content test/content.test.ts
git commit -m "feat: bilingual content for the five stations"
```

---

### Task 4: Géométrie du voyage — fonctions pures (TDD)

**Files:**
- Create: `components/traversee/camera.ts`
- Test: `test/camera.test.ts`

**Interfaces:**
- Produces:
  - constantes `GAP = 14`, `CAM_AHEAD = 6.2`, `STATIONS = 5`, `END = 56`, `FADE = 5.2`, `SMOOTH = 5.5`
  - `stationZ(i: number): number` → `-i * GAP`
  - `progressToZ(p: number): number` → `CAM_AHEAD - clamp01(p) * END`
  - `stationProgress(i: number): number` → `i / (STATIONS - 1)`
  - `stationDistance(camZ: number, i: number): number` → `camZ - (stationZ(i) + CAM_AHEAD)` (0 = en face, > 0 pas encore, < 0 dépassée)
  - `stationVisibility(camZ: number, i: number): number` ∈ [0, 1]
  - `activeStation(camZ: number): number`
  - `smooth(current: number, target: number, dt: number, k?: number): number`

- [ ] **Step 1: Écrire les tests**

`test/camera.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import {
  CAM_AHEAD, END, GAP, STATIONS,
  activeStation, progressToZ, smooth, stationDistance, stationProgress, stationVisibility, stationZ,
} from "@/components/traversee/camera";

describe("geometry", () => {
  it("places stations GAP apart along -z", () => {
    expect(stationZ(0)).toBe(0);
    expect(stationZ(1)).toBe(-GAP);
    expect(END).toBe(GAP * (STATIONS - 1));
  });

  it("maps scroll progress to camera z, clamped", () => {
    expect(progressToZ(0)).toBeCloseTo(CAM_AHEAD);
    expect(progressToZ(1)).toBeCloseTo(CAM_AHEAD - END);
    expect(progressToZ(-1)).toBeCloseTo(CAM_AHEAD);
    expect(progressToZ(2)).toBeCloseTo(CAM_AHEAD - END);
  });

  it("maps a station index to the scroll progress that faces it", () => {
    expect(stationProgress(0)).toBe(0);
    expect(stationProgress(4)).toBe(1);
    expect(progressToZ(stationProgress(2))).toBeCloseTo(stationZ(2) + CAM_AHEAD);
  });
});

describe("stationVisibility", () => {
  const facing1 = stationZ(1) + CAM_AHEAD;
  it("is 1 when the camera faces the station", () => {
    expect(stationDistance(facing1, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1, 1)).toBeCloseTo(1);
  });
  it("fades to 0 at FADE units before or after", () => {
    expect(stationVisibility(facing1 + 5.2, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1 - 5.2, 1)).toBeCloseTo(0);
    expect(stationVisibility(facing1 + 9, 1)).toBe(0);
  });
  it("is 0.5 halfway through the fade", () => {
    expect(stationVisibility(facing1 + 2.6, 1)).toBeCloseTo(0.5);
  });
});

describe("activeStation", () => {
  it("is the first station at the start and the last at the end", () => {
    expect(activeStation(progressToZ(0))).toBe(0);
    expect(activeStation(progressToZ(1))).toBe(STATIONS - 1);
  });
  it("switches at the midpoint between two stations", () => {
    const mid = stationZ(1) + CAM_AHEAD - GAP / 2;
    expect(activeStation(mid + 0.1)).toBe(1);
    expect(activeStation(mid - 0.1)).toBe(2);
  });
});

describe("smooth", () => {
  it("does not move with dt = 0", () => {
    expect(smooth(0, 10, 0)).toBe(0);
  });
  it("converges to the target with a large dt", () => {
    expect(smooth(0, 10, 10)).toBeCloseTo(10, 3);
  });
  it("moves a fixed fraction per second regardless of frame rate", () => {
    const oneStep = smooth(0, 1, 0.1);
    let tenSteps = 0;
    for (let i = 0; i < 10; i++) tenSteps = smooth(tenSteps, 1, 0.01);
    expect(oneStep).toBeCloseTo(tenSteps, 6);
  });
});
```

- [ ] **Step 2: Lancer pour voir échouer**

```bash
npx vitest run test/camera.test.ts
```

Expected : FAIL — module introuvable.

- [ ] **Step 3: Écrire `components/traversee/camera.ts`**

```ts
/**
 * Géométrie du voyage. Fonctions pures, sans three.js, sans DOM :
 * c'est ce qui se teste, le reste (scene.ts) ne fait que les appliquer.
 */
export const GAP = 14;          // unités entre deux étapes
export const CAM_AHEAD = 6.2;   // distance caméra → objet quand l'étape est « en face »
export const STATIONS = 5;
export const END = GAP * (STATIONS - 1);
export const FADE = 5.2;        // distance à laquelle le texte d'une étape est éteint
export const SMOOTH = 5.5;      // raideur du lissage temporel

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function stationZ(i: number): number {
  return -i * GAP;
}

export function progressToZ(p: number): number {
  return CAM_AHEAD - clamp01(p) * END;
}

export function stationProgress(i: number): number {
  return i / (STATIONS - 1);
}

/** 0 = en face ; > 0 pas encore atteinte ; < 0 dépassée. */
export function stationDistance(camZ: number, i: number): number {
  return camZ - (stationZ(i) + CAM_AHEAD);
}

export function stationVisibility(camZ: number, i: number): number {
  return 1 - Math.min(1, Math.abs(stationDistance(camZ, i)) / FADE);
}

export function activeStation(camZ: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < STATIONS; i++) {
    const d = Math.abs(stationDistance(camZ, i));
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** Lissage exponentiel en temps réel : une machine lente arrive quand même. */
export function smooth(current: number, target: number, dt: number, k: number = SMOOTH): number {
  return current + (target - current) * (1 - Math.exp(-dt * k));
}
```

- [ ] **Step 4: Lancer les tests**

```bash
npm test
```

Expected : tous PASS (validation 5, content 3, camera 11).

- [ ] **Step 5: Commit**

```bash
git add components/traversee/camera.ts test/camera.test.ts
git commit -m "feat: pure camera geometry for the scroll-driven journey"
```

---

### Task 5: Les étapes en HTML, le chrome, la page — sans 3D

**Files:**
- Create: `components/ui/Brand.tsx`, `components/ui/Pill.tsx`, `components/ui/Arrows.tsx`, `components/ui/Stats.tsx`, `components/ui/LanguageToggle.tsx`
- Create: `components/traversee/Station.tsx`, `components/traversee/Rail.tsx`, `components/traversee/Traversee.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `stations`, `ui`, `useT`, `useLang` (V2), `stationProgress` (tâche 4).
- Produces: `<Traversee>{children}</Traversee>` (client) qui expose au DOM : `canvas#gl` **absent pour l'instant**, `.track`, `.station[data-st=i]` (avec `inert` sauf `data-st=0`), `.rail button[data-go=i]`, `.pill`. `Traversee` accepte une prop optionnelle `scene?: React.ReactNode` (remplie à la tâche 7).

- [ ] **Step 1: `components/ui/LanguageToggle.tsx`**

```tsx
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
```

- [ ] **Step 2: `components/ui/Brand.tsx`, `Pill.tsx`, `Arrows.tsx`, `Stats.tsx`**

`Brand.tsx` :

```tsx
export function Brand() {
  return <div className="brand u-mono">Flavien Patriarca</div>;
}
```

`Pill.tsx` :

```tsx
"use client";

import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

type Props = { onWork: () => void; onContact: () => void };

export function Pill({ onWork, onContact }: Props) {
  const t = useT();
  return (
    <nav className="pill" aria-label="Navigation">
      <button type="button" onClick={onWork}>{t(ui.nav.work)}</button>
      <span className="sep" aria-hidden="true" />
      <button type="button" onClick={onContact}>{t(ui.nav.contact)}</button>
      <span className="sep" aria-hidden="true" />
      <LanguageToggle />
    </nav>
  );
}
```

`Arrows.tsx` :

```tsx
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
```

`Stats.tsx` :

```tsx
"use client";

import type { I18nString } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Stats({ items }: { items: { value: string; label: I18nString }[] }) {
  const t = useT();
  return (
    <div className="stats">
      {items.map((s) => (
        <div key={s.value + s.label.fr}>
          <b>{s.value}</b>
          <span>{t(s.label)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `components/traversee/Station.tsx`**

Le formulaire de contact arrive à la tâche 8 ; ici un `placeholder` neutre pour l'étape `contact` (une ligne, remplacée à la tâche 8).

```tsx
"use client";

import type { Station as StationData } from "@/lib/content/stations";
import { useT } from "@/lib/i18n";
import { Arrows } from "@/components/ui/Arrows";
import { Stats } from "@/components/ui/Stats";

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
      {station.links && <Arrows links={station.links} />}
    </section>
  );
}
```

- [ ] **Step 4: `components/traversee/Rail.tsx`**

```tsx
"use client";

import { stations } from "@/lib/content/stations";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Rail({ active, goTo }: { active: number; goTo: (i: number) => void }) {
  const t = useT();
  return (
    <nav className="rail" aria-label={t(ui.nav.stages)}>
      {stations.map((s, i) => (
        <button key={s.id} type="button" data-go={i} className={i === active ? "on" : ""} aria-current={i === active ? "step" : undefined} onClick={() => goTo(i)}>
          {t(s.label)}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: `components/traversee/Traversee.tsx`**

```tsx
"use client";

import { useCallback, useState, type ReactNode } from "react";
import { stationProgress } from "@/components/traversee/camera";
import { Rail } from "@/components/traversee/Rail";
import { Brand } from "@/components/ui/Brand";
import { Pill } from "@/components/ui/Pill";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

export function Traversee({ children, scene }: { children: ReactNode; scene?: ReactNode }) {
  const t = useT();
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: stationProgress(i) * max, behavior: reduced ? "auto" : "smooth" });
  }, []);

  return (
    <>
      {scene}
      <div className="grain" aria-hidden="true" />
      <div className="track" aria-hidden="true" />
      <Brand />
      <Pill onWork={() => goTo(1)} onContact={() => goTo(4)} />
      <Rail active={active} goTo={goTo} />
      <main>{children}</main>
      <div className={`hint u-mono ${active === 0 ? "" : "off"}`} aria-hidden="true">{t(ui.nav.scroll)} ↓</div>
      {/* setActive est branché par <Scene/> à la tâche 7 via l'événement ci-dessous */}
      <ActiveListener onChange={setActive} />
    </>
  );
}

/** Reçoit `traversee:active` (CustomEvent<number>) émis par la scène. */
function ActiveListener({ onChange }: { onChange: (i: number) => void }) {
  if (typeof window !== "undefined") {
    window.__traverseeOnActive = onChange;
  }
  return null;
}

declare global {
  interface Window { __traverseeOnActive?: (i: number) => void }
}
```

> Pourquoi un global plutôt qu'un contexte : la scène n'est pas un composant React (c'est `scene.ts`), elle est montée dans un `useEffect`. Un seul callback global, posé par le seul `<Traversee>` de l'app, est le plus petit pont possible. Il est typé et documenté ; s'il faut un jour deux traversées, on passera par une prop.

- [ ] **Step 6: `app/page.tsx`**

```tsx
import { Traversee } from "@/components/traversee/Traversee";
import { Station } from "@/components/traversee/Station";
import { stations } from "@/lib/content/stations";

export default function Home() {
  return (
    <Traversee>
      {stations.map((s, i) => (
        <Station key={s.id} station={s} index={i} />
      ))}
    </Traversee>
  );
}
```

- [ ] **Step 7: CSS des étapes et du chrome — ajouter à la fin de `app/globals.css`**

```css
/* ───────── La traversée ───────── */
canvas#gl { position: fixed; inset: 0; width: 100vw; height: 100vh; display: block; z-index: 0; }
.grain { position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.14; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
/* La hauteur de scroll : c'est elle qui donne la longueur du voyage. */
.track { height: 640vh; }

.brand, .pill, .rail, .hint { position: fixed; z-index: 6; }
.brand { top: 26px; left: 26px; font-size: 9.5px; letter-spacing: 0.26em; color: var(--color-dim); }
.pill { top: 22px; right: 26px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--color-hair); border-radius: 999px; padding: 10px 20px; backdrop-filter: blur(8px); }
.pill button { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-dim); transition: color 0.3s; min-height: 24px; }
.pill button:hover { color: var(--color-text); }
.pill .sep { width: 30px; height: 1px; background: var(--color-hair); }
.hint { left: 50%; bottom: 22px; transform: translateX(-50%); font-size: 8px; letter-spacing: 0.26em; color: var(--color-faint); animation: bob 2.4s ease-in-out infinite; transition: opacity 0.4s; }
.hint.off { opacity: 0; }
@keyframes bob { 50% { transform: translate(-50%, 7px); } }

.rail { right: 30px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 22px; align-items: flex-end; }
.rail button { display: flex; align-items: center; gap: 12px; min-height: 24px; font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-faint); transition: color 0.3s; }
.rail button::after { content: ""; width: 14px; height: 1px; background: currentColor; transform-origin: right center; transition: transform 0.3s; }
.rail button.on { color: var(--color-ice); }
.rail button.on::after { transform: scaleX(2); }
.rail button:hover { color: var(--color-text); }

/* Chaque étape est du HTML réel, dans l'ordre, mais affiché en surimpression :
   la caméra décide de son opacité. Avant la 3D, seule l'étape 0 est visible. */
.station { position: fixed; z-index: 5; top: 50%; transform: translateY(-50%); max-width: 440px; padding: 0 26px; opacity: 0; pointer-events: none; will-change: opacity, transform; }
.station.on { opacity: 1; pointer-events: auto; }
.station.left { left: 0; }
.station.right { right: 0; text-align: right; padding-right: 170px; max-width: 610px; }
.station.right .arrows a::before { content: ""; }
.station.right .arrows a::after { content: " <-"; color: var(--color-ice); }
.station.right .stats { justify-content: flex-end; }
.t-h1 { font-size: clamp(26px, 4vw, 52px); margin-top: 16px; }
.t-h2 { font-size: clamp(22px, 2.6vw, 34px); margin-top: 16px; }
.station .t-body { margin: 16px 0 0; }
.station .t-meta { margin: 18px 0 0; }

.stats { display: flex; gap: 26px; margin-top: 22px; }
.stats b { display: block; font-family: var(--font-mono); font-size: 24px; font-weight: 200; color: var(--color-ice); font-variant-numeric: tabular-nums; }
.stats span { display: block; margin-top: 6px; font-family: var(--font-mono); font-size: 7.5px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--color-faint); }
.arrows { margin-top: 20px; }
.arrows a { display: block; padding: 11px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-family: var(--font-mono); font-size: 9px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-dim); text-decoration: none; transition: color 0.3s; }
.arrows a::before { content: "-> "; color: var(--color-ice); }
.arrows a:hover { color: var(--color-text); }

/* Sans WebGL : la même page, à plat, lisible. */
html.no-gl canvas#gl, html.no-gl .track, html.no-gl .rail, html.no-gl .hint, html.no-gl .grain { display: none; }
html.no-gl main { padding: 120px 0 80px; }
html.no-gl .station { position: static; transform: none !important; opacity: 1 !important; pointer-events: auto; max-width: 640px; margin: 0 auto; padding: 56px 26px; text-align: left; }
html.no-gl .station.right .arrows a::before { content: "-> "; color: var(--color-ice); }
html.no-gl .station.right .arrows a::after { content: ""; }
html.no-gl .station.right .stats { justify-content: flex-start; }

@media (max-width: 720px) {
  .station, .station.right { max-width: 100%; padding: 0 20px 90px; text-align: left; top: auto; bottom: 0; transform: none; }
  .station.right .arrows a::before { content: "-> "; color: var(--color-ice); }
  .station.right .arrows a::after { content: ""; }
  .station.right .stats { justify-content: flex-start; }
  .rail { display: none; }
}
@media (prefers-reduced-motion: reduce) { .hint { animation: none; } }
```

- [ ] **Step 8: Vérifier en local**

```bash
npm run lint && npm run build && npm run dev
```

Ouvrir http://localhost:3000 et contrôler :
- fond noir, nom en haut à gauche, pilule Travaux / Contact / fr en en haut à droite, rail à droite avec « Accueil » en bleu glacier ;
- l'étape 0 (« JE CONSTRUIS DES SYSTÈMES QUI TIENNENT. ») visible en bas à gauche avec ses deux liens CV ; les autres invisibles ;
- Tab : pilule → rail → liens CV ; **jamais** un lien d'une étape invisible (elles sont `inert`) ;
- clic sur « Koopadex » dans le rail : la page scrolle (le rail ne change pas encore d'étape active — normal, la scène arrive à la tâche 7) ;
- bascule `en` : les textes passent en anglais.
- Simuler le repli : dans la console, `document.documentElement.classList.add('no-gl'); document.querySelectorAll('.station').forEach(e => e.removeAttribute('inert'))` → les cinq étapes s'empilent en page verticale lisible.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx app/globals.css components/ui components/traversee
git commit -m "feat: stations, rail and pill chrome rendered as fixed HTML overlays"
```

---

### Task 6: La scène three.js (`scene.ts`)

**Files:**
- Create: `components/traversee/scene.ts`

**Interfaces:**
- Consumes: `camera.ts` (tâche 4).
- Produces:
  ```ts
  export type SceneOptions = {
    canvas: HTMLCanvasElement;
    stationEls: HTMLElement[];        // .station dans l'ordre, longueur STATIONS
    onActiveChange: (i: number) => void;
    reducedMotion: boolean;
    mobile: boolean;
    still?: boolean;                  // rendu fixe pour la capture de la carte (tâche 9)
  };
  export type SceneHandle = { dispose: () => void };
  export function createScene(o: SceneOptions): SceneHandle;
  ```

- [ ] **Step 1: Écrire `components/traversee/scene.ts`**

```ts
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import {
  CAM_AHEAD, END,
  activeStation, progressToZ, smooth, stationDistance, stationVisibility, stationZ,
} from "./camera";

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  stationEls: HTMLElement[];
  onActiveChange: (i: number) => void;
  reducedMotion: boolean;
  mobile: boolean;
  still?: boolean;
};

export type SceneHandle = { dispose: () => void };

/* ── Nappe aurora : l'environnement que le verre réfracte. Jamais affichée. ── */
function aurora(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000"; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = "lighter";
  const blobs: [number, number, number, string][] = [
    [w * 0.18, h * 0.28, w * 0.40, "rgba(255,60,190,.95)"],
    [w * 0.74, h * 0.40, w * 0.38, "rgba(40,220,255,.90)"],
    [w * 0.46, h * 0.82, w * 0.34, "rgba(255,190,90,.75)"],
    [w * 0.95, h * 0.12, w * 0.26, "rgba(150,90,255,.80)"],
  ];
  for (const [cx, cy, r, col] of blobs) {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }
  return c;
}

/* ── Sprite rond pour la poussière : sans lui, les points sont des carrés durs. ── */
function dustSprite(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ── Carte arrondie extrudée : la géométrie de tous les objets foil. ── */
function cardGeometry(w: number, h: number, r: number, depth = 0.07): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.024, bevelSegments: 3, curveSegments: 18 });
}

export function createScene(o: SceneOptions): SceneHandle {
  const { canvas, stationEls, reducedMotion: RM, mobile, still = false } = o;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 6, 30);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);

  const envTex = new THREE.CanvasTexture(aurora(1024, 512));
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTex).texture;

  // Le foil. Valeurs validées sur prototype, à régler à l'œil sur GPU réel.
  const foil = new THREE.MeshPhysicalMaterial({
    transmission: 0.82, thickness: 1.7, roughness: 0.07, metalness: 0, ior: 1.64,
    envMapIntensity: 3.4, clearcoat: 1, clearcoatRoughness: 0.06, specularIntensity: 1, reflectivity: 0.85,
    iridescence: 1, iridescenceIOR: 2.1, iridescenceThicknessRange: [140, 860],
    attenuationColor: new THREE.Color(0x6f8cff), attenuationDistance: 1.6,
    sheen: 0.6, sheenColor: new THREE.Color(0xff9ee8),
  });

  /* ── Les étapes : un groupe par étape, à z = stationZ(i). userData.spin tourne lentement. ── */
  const groups: THREE.Group[] = [];
  const addStation = (i: number, build: (g: THREE.Group) => void) => {
    const g = new THREE.Group();
    g.position.z = stationZ(i);
    build(g);
    scene.add(g);
    groups.push(g);
  };
  // 0 · Accueil : la carte, à droite du texte
  addStation(0, (g) => {
    const m = new THREE.Mesh(cardGeometry(1.6, 2.24, 0.13), foil);
    m.position.set(still ? 0 : 1.3, 0, 0);
    m.rotation.set(0, still ? -0.25 : -0.5, 0.05);
    g.add(m); g.userData.spin = m;
  });
  // 1 · Koopadex : un grand panneau et trois éclats qui flottent devant
  addStation(1, (g) => {
    const p = new THREE.Mesh(cardGeometry(3.2, 2.05, 0.12), foil);
    p.position.set(-1.6, 0.1, 0); p.rotation.set(0.04, 0.55, 0);
    g.add(p); g.userData.spin = p;
    ([[-2.9, -1.05, 1.1], [-0.6, 1.25, 0.8], [-0.2, -1.2, 1.6]] as const).forEach(([x, y, z], k) => {
      const c = new THREE.Mesh(cardGeometry(0.5, 0.34, 0.06, 0.05), foil);
      c.position.set(x, y, z); c.rotation.set(0.3 * k, 0.6 - 0.4 * k, 0.2);
      g.add(c);
    });
  });
  // 2 · Parcours : quatre cartes en escalier
  addStation(2, (g) => {
    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(cardGeometry(1.05, 1.45, 0.1), foil);
      c.position.set(1.0 + k * 0.55, 0.55 - k * 0.45, -k * 1.3); c.rotation.set(0, -0.6, 0.04);
      g.add(c);
    }
  });
  // 3 · Compétences : une hélice de quatorze plaquettes
  addStation(3, (g) => {
    const h = new THREE.Group();
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const c = new THREE.Mesh(cardGeometry(0.42, 0.28, 0.05, 0.04), foil);
      c.position.set(Math.cos(a) * 1.6 - 1.7, (k / 14 - 0.5) * 3.2, Math.sin(a) * 1.6); c.rotation.set(0, -a, 0);
      h.add(c);
    }
    g.add(h); g.userData.spin = h;
  });
  // 4 · Contact : un anneau, seul
  addStation(4, (g) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.11, 24, 96), foil);
    r.position.set(1.2, 0, 0); r.rotation.set(0.9, 0.3, 0);
    g.add(r); g.userData.spin = r;
  });

  /* ── Lumières : montées sur un groupe qui voyage avec la caméra. ── */
  const rig = new THREE.Group();
  const l1 = new THREE.PointLight(0xff4fd8, 46, 26); l1.position.set(-3.4, 2.6, -2); rig.add(l1);
  const l2 = new THREE.PointLight(0x39e6ff, 42, 26); l2.position.set(3.6, -1.6, -3); rig.add(l2);
  const l3 = new THREE.PointLight(0xffca7a, 22, 22); l3.position.set(0.6, -3, -6); rig.add(l3);
  scene.add(rig);
  scene.add(new THREE.AmbientLight(0x223355, 1.1));

  /* ── Poussière le long du couloir : c'est elle qui fait sentir la vitesse. ── */
  const N = RM || mobile ? 900 : 3200;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const tint = new THREE.Color();
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 2] = 8 - Math.random() * (END + 22);
    tint.setHSL(Math.random() < 0.7 ? 0.09 + Math.random() * 0.05 : 0.55, 0.75, 0.55 + Math.random() * 0.3);
    col[i * 3] = tint.r; col[i * 3 + 1] = tint.g; col[i * 3 + 2] = tint.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dustMat = new THREE.PointsMaterial({ size: 0.09, map: dustSprite(), vertexColors: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ── Post-traitement ── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.7, 0.82);
  const useBloom = !RM && !mobile;
  if (useBloom) composer.addPass(bloom);

  /* ── Scroll = position de la caméra. Rien d'autre ne bouge la page. ── */
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  let mx = 0, my = 0, tx = 0, ty = 0;
  let camZ = CAM_AHEAD;
  let t0 = 0;
  let visible = true;
  let lastActive = -1;

  const onPointer = (e: PointerEvent) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; };
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
  };
  const onVisibility = () => { visible = !document.hidden; };
  if (!still) window.addEventListener("pointermove", onPointer);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  renderer.setAnimationLoop((t: number) => {
    if (!visible) return;
    const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
    const p = still ? 0 : Math.min(Math.max(window.scrollY / Math.max(maxScroll(), 1), 0), 1);
    const k = RM || still ? 1 : 1 - Math.exp(-dt * 5.5);
    camZ = smooth(camZ, progressToZ(p), RM || still ? 10 : dt);
    mx += (tx - mx) * k; my += (ty - my) * k;
    camera.position.set(mx * 0.5, -my * 0.3, camZ);
    camera.lookAt(mx * 0.2, -my * 0.12, camZ - 10);
    rig.position.z = camZ;

    groups.forEach((g, i) => {
      const d = stationDistance(camZ, i);
      const v = stationVisibility(camZ, i);
      const el = stationEls[i];
      if (el && !still) {
        el.style.opacity = String(v * v);
        el.style.transform = `translateY(calc(-50% + ${(d * 9).toFixed(1)}px))`;
        const on = v > 0.5;
        el.classList.toggle("on", on);
        el.toggleAttribute("inert", !on);
      }
      const spin = g.userData.spin as THREE.Object3D | undefined;
      if (spin && !RM && !still) spin.rotation.y += dt * 0.12;
      if (!RM && !still) g.position.y = Math.sin(t * 0.0006 + i) * 0.06;
    });

    const active = activeStation(camZ);
    if (active !== lastActive) { lastActive = active; o.onActiveChange(active); }

    if (!RM && !still) {
      l1.position.x = Math.cos(t * 0.00022) * 4.2; l1.position.y = 2.4 + Math.sin(t * 0.00022) * 0.8;
      l2.position.x = Math.cos(t * 0.00031 + 2.1) * 4.4;
    }
    composer.render();
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) obj.geometry.dispose();
      });
      foil.dispose(); dustMat.dispose(); envTex.dispose(); pmrem.dispose();
      composer.dispose(); renderer.dispose();
    },
  };
}
```

- [ ] **Step 2: Vérifier la compilation seule**

```bash
npm run typecheck && npm run lint
```

Expected : aucun diagnostic. (`STATIONS` est importé pour la lisibilité de l'interface ; s'il est signalé inutilisé, retirer l'import — il n'est pas nécessaire au code.)

- [ ] **Step 3: Commit**

```bash
git add components/traversee/scene.ts
git commit -m "feat: three.js scene for the foil journey"
```

---

### Task 7: Monter la scène côté client, repli `no-gl`, étape active

**Files:**
- Create: `components/traversee/Scene.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `createScene` (tâche 6), `window.__traverseeOnActive` (tâche 5).
- Produces: `<Scene />` (client) rendu via la prop `scene` de `<Traversee>`.

- [ ] **Step 1: `components/traversee/Scene.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { SceneHandle } from "@/components/traversee/scene";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function fallbackToFlat() {
  document.documentElement.classList.add("no-gl");
  document.querySelectorAll<HTMLElement>(".station").forEach((el) => {
    el.removeAttribute("inert");
    el.classList.add("on");
  });
}

export function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasWebGL() || new URLSearchParams(location.search).has("nogl")) {
      fallbackToFlat();
      return;
    }

    let handle: SceneHandle | undefined;
    let cancelled = false;
    const stationEls = Array.from(document.querySelectorAll<HTMLElement>(".station"));
    const still = new URLSearchParams(location.search).has("still");
    if (still) document.documentElement.classList.add("still");

    // three.js n'est chargé qu'ici, après hydratation : le LCP reste du texte.
    import("@/components/traversee/scene")
      .then(({ createScene }) => {
        if (cancelled) return;
        handle = createScene({
          canvas,
          stationEls,
          onActiveChange: (i) => window.__traverseeOnActive?.(i),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          mobile: window.innerWidth < 720,
          still,
        });
      })
      .catch(fallbackToFlat);

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return <canvas ref={ref} id="gl" aria-hidden="true" />;
}
```

- [ ] **Step 2: Brancher dans `app/page.tsx`**

```tsx
import { Scene } from "@/components/traversee/Scene";
import { Traversee } from "@/components/traversee/Traversee";
import { Station } from "@/components/traversee/Station";
import { stations } from "@/lib/content/stations";

export default function Home() {
  return (
    <Traversee scene={<Scene />}>
      {stations.map((s, i) => (
        <Station key={s.id} station={s} index={i} />
      ))}
    </Traversee>
  );
}
```

- [ ] **Step 3: Mode `still` en CSS — ajouter à `app/globals.css`**

```css
/* Rendu fixe pour capturer la carte (tâche 9) : rien que le canvas. */
html.still .brand, html.still .pill, html.still .rail, html.still .hint, html.still .grain, html.still main { display: none; }
```

- [ ] **Step 4: Vérifier dans le navigateur**

```bash
npm run lint && npm run build && npm run dev
```

- http://localhost:3000 : la carte foil apparaît à droite du titre, la poussière dérive, la souris fait dériver la caméra. Molette : la caméra avance, l'étape 0 s'efface, le panneau Koopadex et ses éclats arrivent, le texte « KOOPADEX » se cale à droite ; le rail passe sur « Koopadex ». Continuer jusqu'à l'anneau du Contact.
- Clic « Contact » dans la pilule : scroll fluide jusqu'à la dernière étape.
- DevTools → Rendering → « Emulate CSS prefers-reduced-motion: reduce » puis recharger : plus de flottement ni de bloom, le voyage suit le scroll sans inertie.
- http://localhost:3000/?nogl : page verticale, cinq étapes lisibles, liens cliquables.
- http://localhost:3000/?still : uniquement la carte, centrée, sans texte (servira à la tâche 9).
- Onglet caché puis rétabli : la scène reprend.

- [ ] **Step 5: Commit**

```bash
git add components/traversee/Scene.tsx app/page.tsx app/globals.css
git commit -m "feat: mount the scene client-side with a flat no-WebGL fallback"
```

---

### Task 8: Formulaire de contact sur la dernière étape

**Files:**
- Create: `components/contact/ContactForm.tsx`
- Modify: `components/traversee/Station.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `POST /api/contact` (V2) → `{ ok: true }` | `{ ok: false, error: "bad_json" | "Invalid name" | "Invalid email" | "Invalid message" | "not_configured" | "send_failed" }` ; `ui.contact` (tâche 3).
- Produces: `<ContactForm />` rendu dans l'étape `contact`.

- [ ] **Step 1: `components/contact/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ui } from "@/lib/content/ui";
import { useT } from "@/lib/i18n";

type Status = "idle" | "sending" | "success" | "error";
const EMAIL = "flavien.patriarca2002@gmail.com";

export function ContactForm() {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setStatus("success"); formEl.reset(); return; }
      const data = await res.json().catch(() => ({}));
      if (data?.error === "not_configured") {
        // Pas de clé Resend : on ouvre le client mail du visiteur avec le message prérempli.
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Contact de ${payload.name}`)}&body=${encodeURIComponent(payload.message)}`;
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="cform" onSubmit={onSubmit}>
      <div className="row">
        <label>
          <span>{t(ui.contact.name)}</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label>
          <span>{t(ui.contact.email)}</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label>
        <span>{t(ui.contact.message)}</span>
        <textarea name="message" required minLength={5} maxLength={5000} rows={3} />
      </label>
      <div className="row send">
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? t(ui.contact.sending) : `${t(ui.contact.send)} ->`}
        </button>
        <span role="status" aria-live="polite">
          {status === "success" && <span className="ok">{t(ui.contact.success)}</span>}
          {status === "error" && <span className="ko">{t(ui.contact.error)}</span>}
        </span>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: L'insérer dans `Station.tsx`**

Ajouter l'import et, juste avant `{station.links && ...}` :

```tsx
import { ContactForm } from "@/components/contact/ContactForm";
// …
      {station.id === "contact" && <ContactForm />}
```

- [ ] **Step 3: CSS du formulaire — ajouter à `app/globals.css`**

```css
/* ───────── Formulaire de contact ───────── */
.cform { margin-top: 22px; display: grid; gap: 14px; max-width: 420px; }
.cform .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.cform label { display: grid; gap: 6px; }
.cform label span { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--color-faint); }
.cform input, .cform textarea { width: 100%; background: transparent; border: 0; border-bottom: 1px solid var(--color-hair); color: var(--color-text); font: inherit; font-size: 14px; padding: 8px 0; min-height: 24px; resize: none; }
.cform input:focus, .cform textarea:focus { outline: none; border-bottom-color: var(--color-ice); }
.cform .send { grid-template-columns: auto 1fr; align-items: center; }
.cform button { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-ice); min-height: 24px; }
.cform button:disabled { opacity: 0.5; cursor: default; }
.cform [role="status"] { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.16em; text-transform: uppercase; }
.cform .ok { color: var(--color-ice); }
.cform .ko { color: var(--color-dim); }
@media (max-width: 720px) { .cform .row { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Vérifier**

```bash
npm run lint && npm test && npm run dev
```

Aller à l'étape Contact (clic « Contact » dans la pilule). Sans `.env.local` : remplir et envoyer → le client mail s'ouvre avec le message prérempli. Avec `RESEND_API_KEY` dans `.env.local` : envoyer → « Message envoyé. Merci. ». Tab : les champs sont atteignables **seulement** quand l'étape Contact est active.

- [ ] **Step 5: Commit**

```bash
git add components/contact components/traversee/Station.tsx app/globals.css
git commit -m "feat: contact form on the last station, Resend with mailto fallback"
```

---

### Task 9: Page `/koopadex` — contenu, schémas, ornement

**Files:**
- Create: `lib/content/koopadex.ts`
- Create: `components/koopadex/CaseStudy.tsx`, `components/koopadex/TenantDiagram.tsx`, `components/koopadex/FiscalDiagram.tsx`
- Create: `app/koopadex/page.tsx`
- Create: `public/foil-card.png` (capture)
- Modify: `app/globals.css`, `test/content.test.ts`

**Interfaces:**
- Consumes: `I18nString`, `useT`, `LanguageToggle`, `Brand`, `Arrows`, `Stats`.
- Produces: `export const koopadex` (contenu) ; route `/koopadex`.

- [ ] **Step 1: Étendre `test/content.test.ts`**

Ajouter :

```ts
import { koopadex } from "@/lib/content/koopadex";

describe("koopadex case study", () => {
  it("never names the client nor real business figures", () => {
    const all = JSON.stringify(koopadex).toLowerCase();
    expect(all).not.toContain("shoptacarte");
    expect(all).not.toMatch(/\d+\s?(k€|€|eur)\b/);
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
```

- [ ] **Step 2: Lancer pour voir échouer**

```bash
npx vitest run test/content.test.ts
```

Expected : FAIL — `@/lib/content/koopadex` introuvable.

- [ ] **Step 3: `lib/content/koopadex.ts`**

```ts
import type { I18nString } from "@/lib/content/ui";

export type CaseSection = {
  id: "contexte" | "probleme" | "multitenant" | "fiscal" | "caisse" | "chiffres" | "stack" | "appris" | "captures";
  title: I18nString;
  paragraphs: I18nString[];
};

export const koopadex = {
  kicker: { fr: "Case study · 2025 →", en: "Case study · 2025 →" },
  title: { fr: "Koopadex", en: "Koopadex" },
  lede: {
    fr: "Un back-office SaaS multi-boutiques pour l'achat-revente de cartes à collectionner. Il fait tourner une boutique physique, tous les jours, avec une caisse qui doit être légale.",
    en: "A multi-store SaaS back office for buying and selling trading cards. It runs a physical shop, every day, with a register that has to be legal.",
  },
  stats: [
    { value: "30", label: { fr: "Pages", en: "Pages" } },
    { value: "84", label: { fr: "Routes d'API", en: "API routes" } },
    { value: "28", label: { fr: "Familles d'API", en: "API families" } },
    { value: "6", label: { fr: "Types de produits", en: "Product kinds" } },
    { value: "3", label: { fr: "Rôles", en: "Roles" } },
    { value: "5", label: { fr: "Langues produit", en: "Product languages" } },
  ],
  sections: [
    {
      id: "contexte",
      title: { fr: "Le contexte", en: "Context" },
      paragraphs: [
        { fr: "Une boutique physique de cartes à collectionner (Pokémon, Magic, Yu-Gi-Oh, Lorcana, One Piece) vend au comptoir, rachète aux particuliers, prend des cartes en dépôt-vente, envoie des cartes en gradation et encaisse tout ça à la caisse. Chaque geste laisse une trace comptable et fiscale.", en: "A physical trading-card shop (Pokémon, Magic, Yu-Gi-Oh, Lorcana, One Piece) sells over the counter, buys from individuals, takes cards on consignment, sends cards for grading and rings all of it up at the register. Every action leaves an accounting and tax trail." },
        { fr: "Koopadex est la plateforme qui fait tout ça. Une seule installation sert plusieurs enseignes : chaque boutique voit son stock, ses clients, ses tickets, et rien de ce qui appartient aux autres.", en: "Koopadex is the platform that does all of it. One installation serves several shops: each sees its own stock, customers and receipts, and nothing that belongs to the others." },
      ],
    },
    {
      id: "probleme",
      title: { fr: "Le problème", en: "The problem" },
      paragraphs: [
        { fr: "Trois contraintes qui ne se négocient pas : les données de deux boutiques ne doivent jamais se croiser, une vente encaissée ne doit jamais pouvoir être réécrite après coup, et la caisse doit imprimer un ticket sur une vraie imprimante thermique depuis un navigateur.", en: "Three non-negotiable constraints: two shops' data must never cross, a rung-up sale must never be rewritable after the fact, and the register has to print a receipt on a real thermal printer from a browser." },
      ],
    },
    {
      id: "multitenant",
      title: { fr: "Architecture multi-tenant", en: "Multi-tenant architecture" },
      paragraphs: [
        { fr: "Le tenant est résolu depuis le Host de la requête. Chaque ligne en base porte un org_id, et des politiques RLS Postgres refusent tout ce qui ne correspond pas à l'organisation du jeton. Le jeton lui-même est signé en ES256, avec une clé asymétrique, et scopé à une organisation : un jeton volé ne vaut rien ailleurs.", en: "The tenant is resolved from the request Host. Every row carries an org_id, and Postgres RLS policies reject anything that does not match the token's organisation. The token itself is ES256-signed with an asymmetric key and scoped to one organisation: a stolen token is worthless elsewhere." },
        { fr: "Le branding (nom, logo, couleur d'accent) appartient à la boutique et se résout de la même manière. La plateforme, elle, ne s'affiche nulle part.", en: "Branding (name, logo, accent colour) belongs to the shop and resolves the same way. The platform itself is shown nowhere." },
      ],
    },
    {
      id: "fiscal",
      title: { fr: "La chaîne fiscale NF525", en: "The NF525 fiscal chain" },
      paragraphs: [
        { fr: "Chaque vente est mise sous forme canonique, hachée, puis scellée par un HMAC qui inclut le hash de la vente précédente. Modifier ou supprimer une vente casse la chaîne à partir de ce point, et une route de vérification la rejoue de bout en bout. Les clôtures Z portent leur propre chaîne, avec les cumuls du jour et du mois.", en: "Each sale is put in canonical form, hashed, then sealed with an HMAC that includes the previous sale's hash. Editing or deleting a sale breaks the chain from that point on, and a verification route replays it end to end. Z closures carry their own chain, with daily and monthly totals." },
        { fr: "Seul le rôle développeur peut supprimer un ticket, et cela reste tracé. Une clôture faite par erreur reste rouvrable par un administrateur le jour même, pas après.", en: "Only the developer role can delete a receipt, and it stays logged. A closure done by mistake can be reopened by an administrator the same day, not later." },
      ],
    },
    {
      id: "caisse",
      title: { fr: "Caisse et matériel", en: "Register and hardware" },
      paragraphs: [
        { fr: "Le scan de code-barres se fait au téléphone, dans le navigateur, avec ZXing. L'impression passe par un petit agent local qui parle à une Epson TM-T20IV ; le ticket porte un Code 128, les étiquettes un QR. L'encaissement accepte plusieurs moyens de paiement sur un même ticket, et le prix d'une ligne vient toujours de la fiche produit, jamais du poste.", en: "Barcode scanning happens on a phone, in the browser, with ZXing. Printing goes through a small local agent talking to an Epson TM-T20IV; receipts carry a Code 128, labels a QR code. Checkout accepts several payment methods on one receipt, and a line's price always comes from the product record, never from the terminal." },
      ],
    },
    {
      id: "chiffres",
      title: { fr: "En chiffres", en: "In numbers" },
      paragraphs: [
        { fr: "Comptés le 26 août 2026 : 30 pages, 84 routes d'API en 28 familles, 6 types de produits (cartes, scellés, accessoires, merch, bulk, boissons), 3 rôles hiérarchisés, 5 langues produit.", en: "Counted on 26 August 2026: 30 pages, 84 API routes in 28 families, 6 product kinds (cards, sealed, accessories, merch, bulk, drinks), 3 hierarchical roles, 5 product languages." },
      ],
    },
    {
      id: "stack",
      title: { fr: "La stack", en: "The stack" },
      paragraphs: [
        { fr: "Next.js 16 App Router, React 19, TypeScript strict. Supabase (Postgres) avec isolation par org_id et RLS. jose pour les sessions et les jetons ES256, Zod pour la validation, Resend et Svix pour le mailing et son webhook, Cloudinary pour les images, ExcelJS pour l'import-export. Vitest et Testing Library en intégration, Playwright en bout en bout, Husky sur les hooks git. Pas de Tailwind, pas de librairie UI : des variables CSS et des CSS modules.", en: "Next.js 16 App Router, React 19, strict TypeScript. Supabase (Postgres) with org_id isolation and RLS. jose for sessions and ES256 tokens, Zod for validation, Resend and Svix for mailing and its webhook, Cloudinary for images, ExcelJS for import/export. Vitest and Testing Library for integration, Playwright end to end, Husky on git hooks. No Tailwind, no UI library: CSS variables and CSS modules." },
      ],
    },
    {
      id: "appris",
      title: { fr: "Ce que j'ai appris", en: "What I learned" },
      paragraphs: [
        { fr: "Qu'un système se juge le jour où quelqu'un compte dessus. La caisse a encaissé de vrais clients dès le premier jour ; chaque bug avait un visage.", en: "That a system is judged the day someone depends on it. The register took real customers from day one; every bug had a face." },
        { fr: "Que l'isolation, ça se fait dans la base ou ça ne se fait pas. Une politique RLS refuse ce qu'aucune revue de code ne verra passer.", en: "That isolation is done in the database or not at all. An RLS policy rejects what no code review will catch." },
        { fr: "Que le matériel n'est jamais celui de la documentation. Une imprimante thermique, un scanner de téléphone, un réseau de boutique : il faut laisser des réglages, pas moins de code.", en: "That hardware is never the one in the docs. A thermal printer, a phone scanner, a shop network: leave tuning knobs, not less code." },
      ],
    },
    {
      id: "captures",
      title: { fr: "Captures", en: "Screens" },
      paragraphs: [
        { fr: "Toutes les captures sont prises sur un jeu de données de démonstration. Aucun chiffre réel n'y figure.", en: "All screens are taken on a demo dataset. No real figure appears." },
      ],
    },
  ] as CaseSection[],
  /** Rempli à la tâche 13. Vide = la section Captures n'affiche que son paragraphe. */
  captures: [] as { src: string; caption: I18nString; width: number; height: number }[],
};
```

- [ ] **Step 4: Les deux schémas SVG**

`components/koopadex/TenantDiagram.tsx` :

```tsx
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
```

`components/koopadex/FiscalDiagram.tsx` :

```tsx
"use client";

import { useLang } from "@/lib/i18n";

const L = {
  fr: ["Vente", "Forme canonique + hash", "HMAC chaîné (prev_hash)", "Clôture Z", "/api/pos/fiscal/verify"],
  en: ["Sale", "Canonical form + hash", "Chained HMAC (prev_hash)", "Z closure", "/api/pos/fiscal/verify"],
};

export function FiscalDiagram() {
  const { lang } = useLang();
  const boxes = L[lang];
  return (
    <svg className="diagram" viewBox="0 0 720 150" role="img" aria-label={boxes.join(" → ")}>
      <defs>
        <marker id="arr2" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="currentColor" />
        </marker>
      </defs>
      {boxes.slice(0, 4).map((label, i) => {
        const x = 10 + i * 178;
        return (
          <g key={label}>
            <rect x={x} y="40" width="156" height="44" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.35" />
            <text x={x + 78} y="67" textAnchor="middle" fontSize="10.5" fill="currentColor">{label}</text>
            {i < 3 && <line x1={x + 156} y1="62" x2={x + 178} y2="62" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#arr2)" />}
          </g>
        );
      })}
      <path d="M 88 84 C 88 130, 632 130, 632 84" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 3" />
      <text x="360" y="128" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.7">{boxes[4]}</text>
    </svg>
  );
}
```

- [ ] **Step 5: `components/koopadex/CaseStudy.tsx`**

```tsx
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
```

- [ ] **Step 6: `app/koopadex/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CaseStudy } from "@/components/koopadex/CaseStudy";

export const metadata: Metadata = {
  title: "Koopadex — case study · Flavien Patriarca",
  description: "Back-office SaaS multi-boutiques pour cartes à collectionner : multi-tenant par RLS, caisse certifiée NF525, matériel de boutique.",
};

export default function KoopadexPage() {
  return <CaseStudy />;
}
```

- [ ] **Step 7: CSS de la page — ajouter à `app/globals.css`**

```css
/* ───────── Page case study ───────── */
.pill a { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-dim); text-decoration: none; min-height: 24px; display: inline-flex; align-items: center; }
.pill a:hover { color: var(--color-text); }
.case { max-width: 760px; margin: 0 auto; padding: 150px 26px 80px; }
.case-head { position: relative; padding-bottom: 56px; border-bottom: 1px solid var(--color-hair); }
.case-orn { position: absolute; right: -40px; top: -70px; width: 220px; height: auto; opacity: 0.9; pointer-events: none; }
.case-head .t-body { margin-top: 18px; }
.case-sec { padding: 64px 0 0; }
.case-sec .t-h2 { margin-top: 12px; }
.case-sec .t-body { margin-top: 16px; }
.diagram { display: block; width: 100%; height: auto; margin-top: 28px; color: var(--color-ice); font-family: var(--font-mono); }
.captures { display: grid; gap: 34px; margin-top: 28px; }
.captures figure { margin: 0; }
.captures img { width: 100%; height: auto; border: 1px solid var(--color-hair); }
.captures figcaption { margin-top: 10px; }
.case-foot { display: flex; justify-content: space-between; gap: 16px; margin-top: 90px; padding-top: 30px; border-top: 1px solid var(--color-hair); }
.case-foot a { text-decoration: none; color: var(--color-dim); }
.case-foot a:hover { color: var(--color-text); }
@media (max-width: 900px) { .case-orn { position: static; width: 160px; margin-bottom: 20px; } }
```

- [ ] **Step 8: Capturer `public/foil-card.png`**

Lancer `npm run dev`, puis avec l'outil Playwright (MCP) ou un navigateur : ouvrir `http://localhost:3000/?still` en 900 × 1000 px, attendre 2 s que la boucle se stabilise, capturer l'écran. Recadrer sur la carte (~360 × 420 px avec sa marge noire) et enregistrer `public/foil-card.png`. Le fond noir de la capture se fond dans la page ; `next/image` la convertira en WebP/AVIF à la volée. Taille cible ≤ 300 kB.

Si l'outil de capture n'est pas disponible dans la session : créer temporairement une image noire de 360 × 420 px et **noter dans le commit** que l'ornement est à remplacer, puis revenir dessus.

- [ ] **Step 9: Vérifier**

```bash
npm test && npm run lint && npm run build && npm run dev
```

- http://localhost:3000/koopadex : pilule « <- Accueil / fr en », ornement en haut à droite, titre, lede, 6 chiffres, 9 sections numérotées, deux schémas lisibles (texte bleu glacier), pas de section captures vide (juste son paragraphe), pied de page avec lien Contact.
- Bascule `en` : tout passe en anglais, schémas compris.
- Lien « Lire le case study » depuis la home : arrive ici. « <- Accueil » : revient à la home.
- Rechercher « shoptacarte » dans la page : aucun résultat (le test le garantit aussi).

- [ ] **Step 10: Commit**

```bash
git add lib/content/koopadex.ts components/koopadex app/koopadex app/globals.css public/foil-card.png test/content.test.ts
git commit -m "feat: Koopadex case study page with tenant and fiscal diagrams"
```

---

### Task 10: Métadonnées, 404, robots

**Files:**
- Create: `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`
- Modify: `app/layout.tsx` (rien à changer si la tâche 2 est faite ; vérifier `metadataBase`)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SITE_URL` (env ; défaut `http://localhost:3000`).

- [ ] **Step 1: `app/not-found.tsx`**

```tsx
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
```

- [ ] **Step 2: `app/robots.ts` et `app/sitemap.ts`**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${base}/sitemap.xml` };
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/koopadex`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
```

- [ ] **Step 3: Ajouter la variable à `.env.local.example`**

```dotenv
# URL publique du site (metadata, sitemap). Sur Vercel : https://<projet>.vercel.app ou le domaine final.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Vérifier**

```bash
npm run lint && npm run build
```

Expected : routes `/robots.txt` et `/sitemap.xml` listées dans la sortie du build ; `npm run dev` puis http://localhost:3000/nimporte-quoi affiche la 404 dans le bon langage.

- [ ] **Step 5: Commit**

```bash
git add app/not-found.tsx app/robots.ts app/sitemap.ts .env.local.example
git commit -m "feat: not-found page, robots and sitemap"
```

---

### Task 11: Passe performance, mobile, accessibilité

**Files:**
- Modify: `components/traversee/scene.ts` (seulement si les mesures l'exigent)
- Modify: `app/globals.css` (seulement si les mesures l'exigent)

**Interfaces:** aucune nouvelle. Cette tâche **mesure** et ne change que ce qui rate un budget.

- [ ] **Step 1: Build de production et serveur**

```bash
npm run build && npm run start
```

- [ ] **Step 2: Lighthouse**

Avec l'outil Chrome DevTools (MCP `lighthouse_audit`) ou Chrome → Lighthouse, sur `http://localhost:3000/` en **desktop** puis **mobile**, et sur `http://localhost:3000/koopadex` en mobile. Noter les quatre scores et le LCP de chaque run.

Budgets (spec §7) : `/` perf ≥ 85 desktop, ≥ 70 mobile, a11y ≥ 95, LCP < 2,5 s ; `/koopadex` perf ≥ 95.

- [ ] **Step 3: Taille de la scène**

Dans la sortie de `npm run build`, repérer le chunk qui contient three (le plus gros chunk client, chargé par `Scene.tsx`). Il doit rester ≤ 200 kB gzip. S'il dépasse : vérifier qu'aucun import de `three/addons` autre que les trois passes n'a été ajouté, et que `three` n'est importé nulle part côté serveur.

- [ ] **Step 4: Si un budget rate — leviers, dans cet ordre**

1. Mobile : passer `mobile: window.innerWidth < 900` dans `Scene.tsx` (moins de particules, pas de bloom sur plus d'appareils).
2. `renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5))`.
3. `N` desktop de 3200 → 2200.
4. `bloom` : `strength 0.45`, ou le retirer sur desktop aussi (le foil tient sans).
5. LCP : vérifier que `Scene.tsx` n'est pas rendu au-dessus du texte dans l'ordre DOM (il l'est via la prop `scene`, en premier — correct, c'est un canvas vide) et que les polices ont `display: "swap"`.

Refaire Lighthouse après chaque levier, s'arrêter dès que les budgets passent.

- [ ] **Step 5: Accessibilité au clavier et lecteur d'écran**

- Tab depuis le haut de `/` : pilule (Travaux, Contact, fr, en) → rail (5 boutons) → liens de l'étape active uniquement. Entrée sur « Koopadex » dans le rail : la scène avance et le focus reste sur le rail.
- Activer un lecteur d'écran (Narrateur Windows : `Win + Ctrl + Entrée`) : lire la page de haut en bas — les cinq étapes sont annoncées dans l'ordre, titres compris ; le canvas n'est pas annoncé.
- Forcer `prefers-reduced-motion` (DevTools → Rendering) : le voyage suit le scroll sans inertie, rien ne bouge tout seul.
- `?nogl` : cinq étapes lisibles, formulaire fonctionnel.

- [ ] **Step 6: Commit (si des réglages ont été faits)**

```bash
git add -A components app
git commit -m "perf: tune scene budgets for mobile and reduced motion"
```

---

### Task 12: Déploiement Vercel et README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: dépôt `TurT781/portfolio` sur GitHub (tâche 1), variables `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Produces: une URL de production Vercel.

- [ ] **Step 1: Import du projet dans Vercel — à faire par Flavien (compte Vercel au choix)**

1. https://vercel.com/new → « Import Git Repository » → sélectionner `TurT781/portfolio` (autoriser l'app GitHub Vercel sur ce dépôt si demandé).
2. Framework : « Next.js » (détecté). Build command et output : laisser par défaut. Node : 24.
3. Environment Variables : `RESEND_API_KEY` = la clé Resend ; `NEXT_PUBLIC_SITE_URL` = `https://<nom-du-projet>.vercel.app` (le nom s'affiche dans le formulaire d'import).
4. Deploy. Attendre le build vert (il exécute `prebuild` → Vitest, puis `next build`).
5. Copier l'URL de production.

Alternative en ligne de commande, si Flavien préfère : `npm i -g vercel && vercel login && vercel link && vercel env add RESEND_API_KEY production && vercel env add NEXT_PUBLIC_SITE_URL production && vercel --prod`.

- [ ] **Step 2: Vérifier le déploiement**

```bash
URL=https://<nom-du-projet>.vercel.app
curl -sI $URL | head -1
curl -sI $URL/koopadex | head -1
curl -s $URL/sitemap.xml | head -5
curl -s -X POST $URL/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"a@b.com","message":"hello there"}'
```

Expected : `HTTP/2 200` deux fois ; le sitemap liste les deux URLs ; la route contact répond `{"ok":true}` (clé configurée) ou `{"ok":false,"error":"not_configured"}` (pas de clé). Ouvrir `$URL` sur téléphone : la scène tourne, les étapes se lisent en bas d'écran.

- [ ] **Step 3: README final**

Remplacer `README.md` :

````markdown
# Flavien Patriarca — Portfolio

En ligne : https://<nom-du-projet>.vercel.app

Une scène three.js que la molette traverse — cinq étapes en verre « foil » — et un case study
HTML de Koopadex. Bilingue FR/EN. Spec : `docs/superpowers/specs/2026-09-04-portfolio-v3-traversee-design.md`.

## Développement

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest (validation, contenu, géométrie de la caméra)
npm run lint
npm run build      # lance aussi les tests (prebuild)
```

Paramètres d'URL utiles en dev : `?nogl` force la version sans WebGL, `?still` n'affiche que la carte.

## Variables d'environnement

Copier `.env.local.example` → `.env.local`.

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | envoi du formulaire de contact ; sans clé, bascule sur `mailto:` |
| `NEXT_PUBLIC_SITE_URL` | URL publique pour les métadonnées et le sitemap |

## Déploiement

Vercel, importé depuis ce dépôt ; chaque push sur `main` déploie en production. Les mêmes
deux variables sont à renseigner dans le projet Vercel.

## Structure

- `app/` — routes : `/` (traversée), `/koopadex`, `/api/contact`
- `components/traversee/` — `camera.ts` (géométrie pure, testée), `scene.ts` (three.js), `Scene.tsx`, `Traversee.tsx`, `Station.tsx`, `Rail.tsx`
- `lib/content/` — tout le texte, FR et EN
- `public/koopadex/` — captures sur données de démonstration

© 2026 Flavien Patriarca
````

- [ ] **Step 4: Commit et push**

```bash
git add README.md
git commit -m "docs: README with deployment and dev notes"
git push
```

Expected : Vercel redéploie automatiquement ; l'URL répond toujours 200.

---

### Task 13: Captures Koopadex sur données fictives

> Nécessite l'environnement **DEV** de Koopadex (jamais PROD) et les identifiants de Flavien. Le site est complet sans cette tâche : la section Captures n'affiche que son paragraphe tant que `koopadex.captures` est vide.

**Files:**
- Create: `public/koopadex/collection.png`, `public/koopadex/caisse.png`, `public/koopadex/kpi.png`, `public/koopadex/dictionnaire.png`, `public/koopadex/slabs.png`
- Modify: `lib/content/koopadex.ts` (`captures`)

**Interfaces:**
- Consumes: scripts Koopadex `npm run org:create`, `npm run seed:comptable` (dans `/c/Users/flavi/Desktop/code/koopadex`, cible DEV — voir `README.md` §Installation et `MAP.md` de ce dépôt pour la résolution du tenant en local).

- [ ] **Step 1: Une organisation de démonstration sur DEV**

Dans `/c/Users/flavi/Desktop/code/koopadex`, avec `.env.local` pointant sur le projet Supabase **DEV** :

```bash
npm run org:create -- --slug=demo --id=00000000-0000-0000-0000-000000000002 --name="Cartes & Co" --admin=admin --confirm=demo
```

Noter le mot de passe généré. Puis peupler le catalogue et des ventes fictives :

```bash
npm run seed:comptable -- --org=00000000-0000-0000-0000-000000000002
```

Le script refuse de lui-même une URL PROD. Lancer l'app (`npm run dev`), se connecter sur le tenant `demo` avec le compte `admin` (le host local à utiliser est documenté dans `MAP.md` → `src/lib/tenants.ts`).

- [ ] **Step 2: Capturer**

Fenêtre 1440 × 900, thème sombre de l'app, mode discret activé pour les KPI. Cinq écrans : `/collection`, `/pos` (panier avec 3 lignes), `/kpi`, `/dictionary?kind=card`, `/slabs`. Enregistrer en PNG dans `public/koopadex/` sous les noms de la liste ci-dessus. Vérifier à l'œil qu'aucun nom réel de client ni montant réel n'apparaît (la boutique s'appelle « Cartes & Co », les ventes sont générées).

- [ ] **Step 3: Renseigner `captures`**

Dans `lib/content/koopadex.ts`, remplacer `captures: [] as …` par :

```ts
  captures: [
    { src: "/koopadex/collection.png", width: 1440, height: 900, caption: { fr: "Collection — vue stock unifiée, filtres en cascade par type", en: "Collection — unified stock view, cascading filters by kind" } },
    { src: "/koopadex/caisse.png", width: 1440, height: 900, caption: { fr: "Caisse — panier, scan, encaissement multi-paiement", en: "Register — cart, scanning, multi-payment checkout" } },
    { src: "/koopadex/kpi.png", width: 1440, height: 900, caption: { fr: "KPI en mode discret — CA, marge, affluence horaire", en: "KPIs in discreet mode — revenue, margin, hourly footfall" } },
    { src: "/koopadex/dictionnaire.png", width: 1440, height: 900, caption: { fr: "Dictionnaire — valeurs SKU / TAG par type de produit", en: "Dictionary — SKU / TAG values per product kind" } },
    { src: "/koopadex/slabs.png", width: 1440, height: 900, caption: { fr: "Gradation — parcours d'états d'un dossier", en: "Grading — a folder's state journey" } },
  ] as { src: string; caption: I18nString; width: number; height: number }[],
```

- [ ] **Step 4: Vérifier, committer, pousser**

```bash
npm test && npm run build && npm run dev
```

http://localhost:3000/koopadex → section Captures avec cinq images légendées, en FR et en EN. Poids total des PNG ≤ 2 Mo (sinon réduire à 1200 px de large).

```bash
git add public/koopadex lib/content/koopadex.ts
git commit -m "feat: Koopadex screens on demo data"
git push
```

---

## Self-review

**Couverture de la spec.** §1 décisions → tâches 1 (dépôt, plomberie), 2 (typo), 6–7 (three vanilla, scroll natif), 9 (structure `/koopadex`, client non nommé — testé), 13 (captures fictives). §2 DA → tâches 2 (palette, typo), 6 (matière, lumières, poussière, bloom, brouillard, motion, reduced-motion, visibilitychange). §3 architecture → arborescence identique, flux par image dans `scene.ts`, dégradation `no-gl` + `inert` (tâche 7), mobile (tâches 5, 7, 11). §4 étapes → tâche 3 (contenu) + 6 (objets). §5 page Koopadex → tâche 9 (9 sections, 2 schémas, ornement, règles de confidentialité testées). §6 contact → tâche 8. §7 budgets → tâche 11. §8 déploiement → tâches 1 (repo), 12 (Vercel, `.gitignore` complété dès la tâche 1). §9 hors périmètre → rien de construit (pas de son, pas d'IA, pas de projets Epitech sur la home). §10 tests → tâches 3, 4, 9 (Vitest), `prebuild` bloque un déploiement rouge. §11 critères → vérifiés aux tâches 7, 8, 11, 12.

**Placeholders.** Aucun « TBD ». Deux points dépendent de Flavien et sont explicitement marqués comme tels : l'import Vercel (tâche 12, étape 1) et l'environnement DEV de Koopadex (tâche 13). La tâche 9 prévoit le cas où la capture de l'ornement n'est pas possible dans la session.

**Cohérence des noms.** `createScene(SceneOptions): SceneHandle` (tâche 6) = ce que `Scene.tsx` importe (tâche 7). `window.__traverseeOnActive` posé par `Traversee.tsx` (tâche 5), appelé par `Scene.tsx` (tâche 7). `stationProgress`, `progressToZ`, `stationDistance`, `stationVisibility`, `activeStation`, `smooth`, `stationZ` (tâche 4) sont les noms utilisés en 5 et 6. `Station.label` ajouté au type (tâche 3) et lu par `Rail.tsx` (tâche 5). `koopadex.captures` a la même forme aux tâches 9 et 13. Classes CSS `.station .on .left .right .rail .pill .hint .track .grain .arrows .stats .cform .case .diagram` définies dans `globals.css` aux tâches 5, 7, 8, 9 avant d'être utilisées.
