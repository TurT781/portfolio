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
  weight: ["400", "500"],
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
