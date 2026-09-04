import type { Metadata } from "next";
import { CaseStudy } from "@/components/koopadex/CaseStudy";

export const metadata: Metadata = {
  title: "Koopadex — case study · Flavien Patriarca",
  description: "Back-office SaaS multi-boutiques pour cartes à collectionner : multi-tenant par RLS, caisse certifiée NF525, matériel de boutique.",
};

export default function KoopadexPage() {
  return <CaseStudy />;
}
