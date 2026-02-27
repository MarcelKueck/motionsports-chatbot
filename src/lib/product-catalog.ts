import catalogData from "@/data/product-catalog.json";
import { Product } from "./types";

export const productCatalog: Product[] = catalogData as unknown as Product[];

export function getProductById(id: string): Product | undefined {
  return productCatalog.find((p) => p.id === id);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
}
