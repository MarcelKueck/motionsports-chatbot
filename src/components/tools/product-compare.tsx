"use client";

import { Product } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface ProductCompareProps {
  products: Product[];
  comparisonContext?: string;
}

export function ProductCompare({
  products,
  comparisonContext,
}: ProductCompareProps) {
  // Find common spec keys
  const allSpecKeys = new Set<string>();
  products.forEach((p) =>
    Object.keys(p.specifications).forEach((k) => allSpecKeys.add(k))
  );

  // Use keys that exist in at least 2 products, or all if only 2 products
  const specKeys = Array.from(allSpecKeys).filter((key) => {
    const count = products.filter((p) => p.specifications[key] !== undefined).length;
    return count >= Math.min(2, products.length);
  });

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden max-w-full">
      {comparisonContext && (
        <div className="px-4 py-2 border-b border-border">
          <p className="text-xs text-text-muted italic">{comparisonContext}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header: product images + names */}
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-text-muted font-normal text-xs w-28 min-w-[112px]" />
              {products.map((p) => (
                <th key={p.id} className="p-3 text-center min-w-[160px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white rounded-lg p-2 w-24 h-20 flex items-center justify-center">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="max-h-16 w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-primary leading-tight">
                      {p.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr className="border-b border-border">
              <td className="p-3 text-xs text-text-muted font-medium">Preis</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  {p.salePrice ? (
                    <div>
                      <span className="text-sm font-bold text-sale">
                        {p.salePrice.toLocaleString("de-DE")} €
                      </span>
                      <br />
                      <span className="text-xs text-text-muted line-through">
                        {p.price.toLocaleString("de-DE")} €
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-text-primary">
                      {p.price.toLocaleString("de-DE")} €
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Specs */}
            {specKeys.map((key) => (
              <tr key={key} className="border-b border-border">
                <td className="p-3 text-xs text-text-muted font-medium">
                  {key}
                </td>
                {products.map((p) => (
                  <td
                    key={p.id}
                    className="p-3 text-center text-xs font-mono text-text-secondary"
                  >
                    {p.specifications[key] !== undefined
                      ? String(p.specifications[key])
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Dimensions */}
            <tr className="border-b border-border">
              <td className="p-3 text-xs text-text-muted font-medium">
                Maße (B×H×T)
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="p-3 text-center text-xs font-mono text-text-secondary"
                >
                  {p.dimensions.width} × {p.dimensions.height} ×{" "}
                  {p.dimensions.depth} cm
                </td>
              ))}
            </tr>

            {/* Weight */}
            <tr className="border-b border-border">
              <td className="p-3 text-xs text-text-muted font-medium">
                Gewicht
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="p-3 text-center text-xs font-mono text-text-secondary"
                >
                  {p.dimensions.weight} kg
                </td>
              ))}
            </tr>

            {/* Target Group */}
            <tr className="border-b border-border">
              <td className="p-3 text-xs text-text-muted font-medium">
                Zielgruppe
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="p-3 text-center text-xs text-text-secondary"
                >
                  {p.targetGroup.join(", ")}
                </td>
              ))}
            </tr>

            {/* Delivery */}
            <tr className="border-b border-border">
              <td className="p-3 text-xs text-text-muted font-medium">
                Lieferzeit
              </td>
              {products.map((p) => (
                <td
                  key={p.id}
                  className="p-3 text-center text-xs text-text-secondary"
                >
                  {p.deliveryTime}
                </td>
              ))}
            </tr>

            {/* Links */}
            <tr>
              <td className="p-3" />
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <a
                    href={p.shopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                  >
                    Zum Produkt
                    <ExternalLink size={11} />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
