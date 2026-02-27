"use client";

import { Product } from "@/lib/types";
import { MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ShowroomSuggestionProps {
  products: Product[];
}

export function ShowroomSuggestion({ products }: ShowroomSuggestionProps) {
  const productNames = products.map((p) => p.name).join(", ");

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 max-w-md space-y-3">
      <div className="flex items-start gap-2">
        <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Showroom in Gröbenzell bei München
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Möchtest du {productNames} vor dem Kauf testen? Besuche unseren
            Showroom!
          </p>
        </div>
      </div>

      <motion.a
        href="https://motionsports.de/pages/showroom-munchen-grobenzell"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-bg-secondary border border-border hover:border-accent text-text-primary font-medium text-sm rounded-xl transition-colors"
      >
        Termin vereinbaren
        <ExternalLink size={14} />
      </motion.a>

      <p className="text-[11px] text-text-muted text-center">
        Terminvereinbarung erforderlich
      </p>
    </div>
  );
}
