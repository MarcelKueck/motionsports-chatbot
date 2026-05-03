"use client";

import type { Product } from "@/lib/types";
import { Mail, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const REASON_LABELS: Record<string, { title: string; sub: string }> = {
  studio_consultation: {
    title: "Persönliche Studio-Beratung",
    sub: "Ein Studio-Spezialist meldet sich für ein individuelles Konzept.",
  },
  public_sector_quote: {
    title: "Formelles Angebot anfordern",
    sub: "Mit Kauf auf Rechnung, Zahlungsziel und CE-Doku.",
  },
  physio_consultation: {
    title: "Physio- / Reha-Beratung",
    sub: "Persönliche Beratung zu Reha-Einsatz und Medizinprodukten.",
  },
  bulk_discount: {
    title: "Mengenrabatt anfragen",
    sub: "Wir erstellen ein individuelles Angebot.",
  },
  leasing: {
    title: "Leasing-Anfrage",
    sub: "Flexible Finanzierung für gewerbliche Kunden.",
  },
  maintenance: {
    title: "Wartungsvertrag",
    sub: "Langfristige Wartung und Ersatzteilversorgung.",
  },
  general: {
    title: "Persönliche Beratung",
    sub: "Wir helfen dir gerne weiter.",
  },
};

interface ContactFormCardProps {
  reason: string;
  message: string;
  products?: Product[];
}

export function ContactFormCard({
  reason,
  message,
  products,
}: ContactFormCardProps) {
  const meta = REASON_LABELS[reason] ?? REASON_LABELS.general;
  const productParam = products?.length
    ? `&products=${encodeURIComponent(products.map((p) => p.id).join(","))}`
    : "";
  const messageParam = message
    ? `&message=${encodeURIComponent(`Bezug: ${meta.title}.\n\n`)}`
    : "";
  const href = `/contact?reason=${encodeURIComponent(reason)}${productParam}${messageParam}`;

  return (
    <div className="bg-bg-card border border-accent/30 rounded-xl p-4 max-w-md space-y-3">
      <div className="flex items-start gap-2">
        <Mail size={18} className="text-accent shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {meta.title}
          </p>
          <p className="text-xs text-text-secondary mt-1">{message || meta.sub}</p>
        </div>
      </div>

      {products && products.length > 0 && (
        <div className="text-[11px] text-text-muted bg-bg-secondary border border-border rounded-lg px-2.5 py-1.5">
          Im Bezug:{" "}
          {products.map((p, i) => (
            <span key={p.id}>
              {i > 0 ? ", " : ""}
              <span className="text-text-secondary">{p.name}</span>
            </span>
          ))}
        </div>
      )}

      <motion.a
        href={href}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-bg-primary font-semibold text-sm rounded-xl transition-colors"
      >
        Kontaktformular öffnen
        <ExternalLink size={14} />
      </motion.a>
    </div>
  );
}
