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
