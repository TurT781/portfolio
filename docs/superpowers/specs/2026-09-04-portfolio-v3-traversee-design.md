# Portfolio V3 — « Traversée Foil » — Design Spec

Date : 2026-09-04 · Statut : direction validée en brainstorming sur prototypes interactifs
· Prototypes : [Vestibule Foil](https://claude.ai/code/artifact/5e5cd361-0157-4659-83b8-267fe368557b)
(hero seul) et [Traversée Foil](https://claude.ai/code/artifact/5dece589-eb16-4c23-9122-e2a6ca632568)
(scène complète, **c'est celui-ci qui fait foi**).

Ce document remplace la V2 « éditoriale » (branche `feat/portfolio-v2-redesign`, jamais
déployée). Il décrit ce qu'on construit, pas comment on le planifie : le plan
d'implémentation est un document séparé.

## 1. Décisions verrouillées

| Sujet | Décision |
| --- | --- |
| Dépôt | Nouveau dépôt public **`TurT781/portfolio`**, dossier local `C:\Users\flavi\Desktop\code\portfolio`, historique neuf. `MyPortfolio` reste intact ; sa branche `gh-pages` (ancien site) reste en ligne jusqu'au basculement DNS. |
| Base technique | Reprise **à l'identique** de la plomberie V2 : Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, i18n FR/EN par contexte client + `localStorage` (`lib/i18n.tsx`), `POST /api/contact` via Resend + `lib/validation.ts` + son test Vitest, CV PDF FR/EN, photo. Tout le reste (design system, composants, contenus) est réécrit. |
| Référence | **Active Theory** (activetheory.net) : noir absolu, une scène WebGL comme page, une police mono technique en capitales, verre iridescent, poussière lumineuse, UI en pilules à filet. |
| Concept | **Le foil holographique d'une carte rare.** Koopadex fait tourner une boutique de cartes à collectionner ; une carte rare est une surface qui décompose la lumière. La matière iridescente sort du sujet, elle n'est pas un emprunt. |
| Ambition | Le « vestibule » (hero WebGL, site rapide derrière) **étendu à toute la home** : une scène unique que la molette traverse, cinq étapes qui viennent au visiteur. Validé le 2026-09-04 sur le prototype Traversée. |
| Structure | `/` = la traversée · `/koopadex` = case study complet en HTML rapide · rien d'autre. |
| Koopadex | Case study **complet** avec captures d'écran sur **données fictives** (jeu de démo local, jamais de flou sur données réelles). Le client (Shoptacarte) **n'est pas nommé** ; on écrit « une boutique physique ». |
| 3D | **three.js vanilla** (pas de React Three Fiber, pas de drei). Le prototype tient en ~150 lignes qui marchent ; R3F ajouterait deux dépendances et un modèle mental pour rien. À revoir seulement si la scène doit un jour être pilotée par de l'état React fin. |
| Scroll | **Jamais détourné.** La molette native, le trackpad, le clavier et le tactile pilotent la caméra via `scrollY`. Pas de Lenis, pas de smooth-scroll maison. |
| Typo | **Martian Mono** (structure, labels, titres, en capitales) + **Schibsted Grotesk** (texte de lecture). Google Fonts via `next/font`. |

## 2. Direction artistique

### Palette

| Token | Valeur | Usage |
| --- | --- | --- |
| `--ground` | `#000000` | fond, partout, sans exception |
| `--ice` | `#a9e5ff` | accent UI : kickers, chiffres, rail actif, focus |
| `--text` / `--dim` / `--faint` | blanc à 92 % / 55 % / 34 % | trois niveaux de texte, pas plus |
| `--hair` | blanc à 16 % | filets, bordures de pilule |
| foil magenta / cyan / or | `#ff3cbe` / `#28dcff` / `#ffbe5a` | **uniquement** dans la matière 3D et les lumières. Jamais en aplat, jamais sur du texte. |

Thème unique : le site est noir quel que soit le réglage système du visiteur. Le fond et
chaque couleur sont peints explicitement.

### Typographie

- Martian Mono : 200 pour les titres (26 → 52 px, `clamp`), 300/400 pour labels et
  navigation (8 → 9,5 px, interlettrage `.2em` → `.3em`, capitales).
- Schibsted Grotesk 300 pour les paragraphes (14,5 px, interligne 1,7, ≤ 62 ch).
- `text-wrap: balance` sur les titres, `tabular-nums` sur les chiffres.

### Matière (le foil)

`MeshPhysicalMaterial` : `transmission .82`, `thickness 1.7`, `roughness .07`, `ior 1.64`,
`envMapIntensity 3.4`, `clearcoat 1`, `iridescence 1`, `iridescenceIOR 2.1`,
`iridescenceThicknessRange [140, 860]`, `attenuationColor #6f8cff`, `sheen .6`.
Ces valeurs sont un point de départ validé, à régler à l'œil sur GPU réel.

Deux règles apprises sur le prototype et **non négociables** :

1. Un verre transmissif sur fond noir ne réfracte que du noir. La scène a un
   `scene.environment` coloré (nappe aurora magenta / cyan / or générée en canvas, passée
   par `PMREMGenerator`) qui **n'est jamais affiché** : il ne sert qu'aux reflets.
2. Le fond de page reste noir. Le seul halo autorisé est un plan additif minuscule,
   opacité ≤ .16, **fondu sur ses bords** (masque radial), derrière l'objet de l'étape.

### Lumière, poussière, post-traitement

- Trois `PointLight` (magenta, cyan, or) montés sur un groupe qui **voyage avec la
  caméra** : chaque étape est éclairée pareil. Deux d'entre elles orbitent lentement, c'est
  ce qui fait « couler » le foil.
- Poussière : `Points` avec sprite rond (jamais de points carrés), ~3 200 particules
  réparties sur toute la longueur du couloir, 70 % or / 30 % cyan, blending additif.
  C'est elle qui fait sentir la vitesse.
- `UnrealBloomPass` strength .55, radius .7, threshold .82. Grain SVG à 14 % en overlay CSS.
- `Fog` noir de 6 à 30 unités : les étapes lointaines émergent du noir.

### Motion

- **La molette = la caméra.** `p = scrollY / (scrollHeight − innerHeight)`,
  cible `camZ = CAM_AHEAD − p · END`. Lissage **temporel** (`1 − e^(−dt·5.5)`), pas par
  image : une machine lente arrive quand même.
- Dérive souris : caméra ±.5 en x, ±.3 en y, lissée. Objets d'étape : rotation lente et
  flottement de ±.06.
- Entrée du titre de l'étape 0 : masque vertical, mots décalés de 100 ms.
- `prefers-reduced-motion` : pas de spin, pas de flottement, pas de bloom, lissage
  instantané, poussière réduite. Le voyage reste piloté par le visiteur, donc autorisé.
- `visibilitychange` : la boucle se met en pause quand l'onglet est caché.

### Interdits

Dégradé sur du texte · glow `box-shadow` coloré sur des cartes · Inter, Space Grotesk,
Instrument Serif · emoji · icônes décoratives · sections « card » à ombre portée ·
détournement du scroll · toute couleur foil en aplat UI.

## 3. Architecture

```
app/
  layout.tsx              polices, LanguageProvider, metadata, <html> noir
  page.tsx                la traversée : HTML des 5 étapes rendu côté serveur + <Scene/>
  koopadex/page.tsx       case study, HTML pur, zéro WebGL
  api/contact/route.ts    repris V2
  globals.css             tokens, base, .station, .rail, .pill, mode .no-gl
components/
  traversee/Scene.tsx     "use client" ; dynamic import ssr:false de scene.ts ; refs DOM
  traversee/scene.ts      three : renderer, environnement, matière, étapes, lumières, boucle
  traversee/camera.ts     fonctions PURES : progressToZ, stationVisibility, activeStation
  traversee/Station.tsx   overlay HTML d'une étape (kicker, titre, corps, liens)
  traversee/Rail.tsx      rail de progression, boutons cliquables
  ui/Pill.tsx             navigation en pilule (Travaux / Contact / FR-EN)
  ui/Arrows.tsx           liste de liens « -> »
  ui/Stats.tsx            chiffres + label
  contact/ContactForm.tsx repris V2, restylé
  koopadex/*              sections du case study
lib/
  i18n.tsx                repris V2
  validation.ts           repris V2
  content/stations.ts     contenu des 5 étapes, FR + EN
  content/koopadex.ts     contenu du case study, FR + EN
public/
  pdf/FR_CV… , pdf/EN_Resume… , me.png
  koopadex/*.webp         captures anonymisées
  foil-card.webp          rendu statique de la carte (ornement de la page Koopadex)
test/
  validation.test.ts      repris V2
  camera.test.ts          les trois fonctions pures
```

### Flux par image

```
scrollY ─▶ p ─▶ camZ cible ─▶ lissage ─▶ camZ
                                          │
              pour chaque étape i :  d = camZ − (z_i + CAM_AHEAD)
                                     v = 1 − min(1, |d| / 5.2)
                                     opacity = v² · translateY(d·9px) · on = v > .5
                                          │
                              étape active = argmin |d|  ─▶ rail (seulement si change)
```

La boucle écrit **directement dans le DOM** via des refs (opacité, transform, `inert`).
Aucun état React par image. React n'est prévenu que quand l'étape active change.

### Dégradation

- **Sans WebGL** (contexte refusé, ou `three` qui ne charge pas) : la classe `no-gl` est
  posée sur `<html>` ; `.station` passe de `fixed` à un flux vertical normal. Le site
  devient une page classique, lisible, avec le même langage visuel. C'est aussi ce que
  voit un crawler.
- **Avant le chargement de la scène** : l'étape 0 est visible d'office (CSS), les autres à
  0. Le LCP est du texte, pas du canvas.
- **Mobile (< 720 px)** : DPR ≤ 1.25, ~900 particules, pas de bloom, rail masqué, texte
  d'étape en pleine largeur aligné en bas.

### Accessibilité

- Tout le contenu est du HTML dans l'ordre de lecture ; le canvas est `aria-hidden`.
- Les étapes inactives reçoivent l'attribut `inert` : le clavier ne tombe jamais sur un
  lien invisible. Le rail et la pilule sont toujours focusables.
- Focus visible en `--ice`, 2 px, décalé de 4 px. Contraste : `--dim` sur noir ≥ 7:1.
- Cibles cliquables ≥ 24 px.

## 4. Les cinq étapes

Ordre = voyage, donc la numérotation porte du sens. Chaque étape : un objet 3D en foil, un
côté pour le texte, un contenu FR/EN dans `lib/content/stations.ts`.

| # | Étape | Objet | Texte | Contenu |
| --- | --- | --- | --- | --- |
| 0 | Accueil | la carte (1.6 × 2.24), à droite | gauche | kicker « Développeur full-stack · Lyon », titre « Je construis des systèmes qui tiennent. », méta « Caisse certifiée NF525 · SaaS multi-tenant · Automatisations data », liens CV FR/EN |
| 1 | Koopadex | grand panneau (3.2 × 2.05) + trois éclats | droite | kicker « 01 — Œuvre principale · 2025 → », titre, 3 phrases, stats **30 pages / 84 routes d'API / NF525**, lien « Lire le case study » → `/koopadex` |
| 2 | Parcours | quatre cartes en escalier | gauche | Masaï (alternance, depuis mai 2025) · Epitech AER (janvier 2025) · Alice & Jules (stage, mars–mai 2024) · ACAVIRT (stage). Une ligne chacun, pas de bullets. |
| 3 | Compétences | hélice de 14 plaquettes | droite | quatre lignes : langages · front · données & infra · ingénierie IA. **Aucune barre de pourcentage.** |
| 4 | Contact | un anneau, centré | gauche | titre « Un projet, une opportunité, ou juste discuter. », formulaire (nom, email, message), liens GitHub · LinkedIn · email direct |

Géométrie : `GAP = 14` unités entre étapes, `CAM_AHEAD = 6.2`, hauteur de scroll
`640vh`. Le rail et la pilule font `scrollTo` sur `p_i = i / 4`.

## 5. Page `/koopadex`

HTML rapide, même langage (noir, mono, filets, flèches), **aucun WebGL**. Ornement en tête :
`foil-card.webp`, un rendu statique de la carte exporté depuis la scène.

Sections, dans cet ordre :

1. **Contexte** — une boutique physique de cartes à collectionner ; ce qu'elle doit faire
   chaque jour (vendre, racheter, déposer, grader, encaisser).
2. **Le problème** — plusieurs enseignes, une seule installation, des données qui ne
   doivent jamais se croiser, une caisse qui doit être légale.
3. **Architecture multi-tenant** — schéma SVG inline : `Host` → résolution du tenant →
   `org_id` → RLS Postgres → jeton par organisation signé ES256 (`jose`).
4. **Chaîne fiscale NF525** — schéma SVG inline : vente → scellement HMAC chaîné →
   clôture Z → `/api/pos/fiscal/verify`. Pourquoi personne ne peut réécrire l'historique.
5. **Caisse et matériel** — scan code-barres au téléphone (`@zxing/browser`), impression
   Epson TM-T20IV par agent local, Code 128 sur les tickets, encaissement multi-paiement.
6. **Chiffres** — 30 pages, 84 routes d'API en 28 familles, 6 types de produits, 3 rôles,
   5 langues produit. Comptés le 2026-08-26.
7. **Stack** — Next.js 16, React 19, TypeScript strict, Supabase/Postgres, Zod, Resend +
   Svix, Cloudinary, ExcelJS, Vitest + Playwright. Pas de Tailwind, pas de librairie UI.
8. **Ce que j'ai appris** — trois paragraphes à la première personne, sans jargon.
9. **Captures** — 4 à 6 captures WebP sur données fictives : collection, caisse, KPI en
   mode discret, dictionnaire. Chacune légendée.

Règles de confidentialité : données fictives uniquement, pas de nom de client, pas de
marge ni de CA réels, pas d'URL du client, pas de capture des e-mails clients.

## 6. Route API contact

Reprise telle quelle : `POST /api/contact`, validation `lib/validation.ts`, envoi Resend,
`503 not_configured` sans clé → le formulaire bascule sur `mailto:`. Un seul changement :
le `from` passe sur le domaine du portfolio dès qu'il existe (sinon `onboarding@resend.dev`).

## 7. Performance

| Budget | Cible |
| --- | --- |
| LCP (texte de l'étape 0) | < 2,5 s en 4G simulée |
| Scène | chargée en `dynamic import` après hydratation, ≤ 200 kB gz (three core + 3 passes) |
| Lighthouse desktop / mobile | performance ≥ 85 / ≥ 70 avec la 3D active ; accessibilité ≥ 95 |
| Boucle | 60 fps sur GPU intégré récent ; DPR plafonné à 1.6 desktop |
| `/koopadex` | Lighthouse performance ≥ 95 (pas de 3D) |

## 8. Déploiement

1. Créer le dépôt `TurT781/portfolio` (`gh repo create`), pousser `main`.
2. Importer dans Vercel (framework Next.js détecté), variable `RESEND_API_KEY`.
3. Domaine : au choix de Flavien ; par défaut `*.vercel.app`. L'ancien site sur
   `gh-pages` reste en ligne jusqu'au basculement.
4. La CLI Vercel n'est pas installée sur le poste ; l'import par le tableau de bord suffit,
   `npm i -g vercel` seulement si on veut `vercel env pull`.

`.gitignore` du nouveau dépôt : celui de V2 + `.superpowers/` + `.playwright-mcp/`.

## 9. Hors périmètre v1 (YAGNI)

- Son d'ambiance (le bouton « Son » du prototype **est retiré** ; il revient avec une
  boucle libre de droits si Flavien en fournit une).
- « Ask me anything » (chat IA sur le contenu du portfolio) — bonne idée, v2.
- Galerie 3D navigable pour les projets secondaires.
- Blog, CMS, analytics, mode clair.
- Projets Epitech (Job Board, Jeu 2D, App mobile) : **absents de la home**. Ils
  n'apportent rien face à Koopadex ; ils peuvent revenir en liste sur `/koopadex` ou dans
  le CV.

## 10. Tests

- Vitest : `validation.test.ts` (repris) et `camera.test.ts` — `progressToZ` aux bornes,
  `stationVisibility` en face / à 5.2 / au-delà, `activeStation` à mi-chemin entre deux
  étapes.
- `next build` et `next lint` verts : condition de merge.
- Vérification manuelle : Lighthouse sur `/` et `/koopadex`, navigation clavier complète,
  `prefers-reduced-motion` forcé dans les DevTools, mode `no-gl` forcé.

## 11. Critères de succès

- Le site est en ligne sur Vercel, en FR et en EN, sur un dépôt neuf.
- Un visiteur qui ne touche pas la souris voit, en moins de 3 secondes, le nom, le métier
  et une carte foil qui bouge.
- Un recruteur trouve le case study Koopadex en un scroll ou un clic, et le CV en deux.
- Un visiteur au clavier ou avec un lecteur d'écran parcourt les cinq étapes et envoie le
  formulaire.
- Aucune donnée réelle de la boutique cliente n'apparaît.
- Les budgets de la section 7 sont tenus.
