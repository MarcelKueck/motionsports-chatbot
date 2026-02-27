"use client";

import { Product } from "@/lib/types";
import { ExternalLink, Truck } from "lucide-react";

interface ProductCardProps {
  product: Product;
  reason?: string;
}

function getBadgeColor(tag: string): string {
  switch (tag.toLowerCase()) {
    case "bestseller":
      return "bg-badge-bestseller/20 text-badge-bestseller";
    case "neu":
    case "new":
      return "bg-badge-new/20 text-badge-new";
    case "sale":
      return "bg-sale/20 text-sale";
    case "preis-tipp":
      return "bg-accent/20 text-accent";
    case "premium":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-text-muted/20 text-text-secondary";
  }
}

export function ProductCard({ product, reason }: ProductCardProps) {
  const specEntries = Object.entries(product.specifications).slice(0, 4);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden max-w-md">
      {/* Image */}
      <div className="relative bg-white p-4 flex items-center justify-center">
        <img
          src={product.images[0]}
          alt={product.name}
          className="max-h-44 w-auto object-contain"
          loading="lazy"
        />
        {/* Series badge */}
        {product.series && (
          <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-primary/80 text-text-secondary border border-border">
            {product.series}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name & Tags */}
        <div>
          <h3 className="font-semibold text-base text-text-primary leading-tight">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getBadgeColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {product.salePrice ? (
            <>
              <span className="text-xl font-bold text-sale">
                {product.salePrice.toLocaleString("de-DE")} €
              </span>
              <span className="text-sm text-text-muted line-through">
                {product.price.toLocaleString("de-DE")} €
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-text-primary">
              {product.price.toLocaleString("de-DE")} €
            </span>
          )}
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {specEntries.map(([key, value]) => (
            <div key={key} className="min-w-0">
              <p className="text-[11px] text-text-muted truncate">{key}</p>
              <p className="text-xs text-text-secondary font-mono truncate">
                {String(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Reason */}
        {reason && (
          <p className="text-xs text-text-muted italic border-l-2 border-accent/30 pl-2">
            {reason}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Truck size={12} />
            <span>{product.deliveryTime}</span>
          </div>
          <a
            href={product.shopifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Zum Produkt
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
