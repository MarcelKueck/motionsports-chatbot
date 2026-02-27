"use client";

import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
  message: string;
}

export function AddToCartButton({ product, message }: AddToCartButtonProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 max-w-md space-y-3">
      <p className="text-sm text-text-primary font-medium">{message}</p>

      <motion.a
        href={product.shopifyCartUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-accent hover:bg-accent-hover text-bg-primary font-semibold text-sm rounded-xl transition-colors"
      >
        <ShoppingCart size={18} />
        <span>{product.name} in den Warenkorb</span>
      </motion.a>

      <p className="text-[11px] text-text-muted text-center">
        Du wirst zu motionsports.de weitergeleitet
      </p>
    </div>
  );
}
