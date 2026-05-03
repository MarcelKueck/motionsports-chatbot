import OpenAI from "openai";
import embeddingsData from "@/data/product-embeddings.json";
import { productCatalog } from "./product-catalog";
import type { CustomerProfile, Product, SearchProductsArgs } from "./types";

interface EmbeddingsFile {
  model: string;
  dim: number;
  items: Array<{ id: string; vector: number[] }>;
}

const EMBEDDINGS = embeddingsData as EmbeddingsFile;
const EMBEDDING_INDEX = new Map(EMBEDDINGS.items.map((it) => [it.id, it.vector]));
const HAS_EMBEDDINGS = EMBEDDING_INDEX.size > 0;
const EMBEDDING_MODEL = EMBEDDINGS.model || "text-embedding-3-small";

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) openaiClient = new OpenAI();
  return openaiClient;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Hard filters that always apply, drawn from explicit profile signals.
 * These are conservative — when in doubt we keep the product.
 */
function applyHardFilters(
  products: Product[],
  profile: CustomerProfile,
  filters: SearchProductsArgs["filters"]
): Product[] {
  return products.filter((p) => {
    // Tool-level filters from the LLM
    if (filters?.category && p.category !== filters.category) return false;
    if (filters?.maxPriceEUR != null && (p.salePrice ?? p.price) > filters.maxPriceEUR) return false;
    if (filters?.minPriceEUR != null && (p.salePrice ?? p.price) < filters.minPriceEUR) return false;
    if (filters?.maxFootprintM2 != null && typeof p.footprintM2 === "number" && p.footprintM2 > filters.maxFootprintM2) return false;
    if (filters?.requiresMedical && p.medicalCertification?.suitableForRehab !== true) return false;
    if (filters?.requiresQuiet && typeof p.noiseLevelDb === "number" && p.noiseLevelDb > 65) return false;

    // Profile-derived soft filters
    if (typeof profile.budgetEUR === "object" && profile.budgetEUR) {
      const price = p.salePrice ?? p.price;
      if (profile.budgetEUR.max != null && price > profile.budgetEUR.max * 1.15) return false;
    }
    if (typeof profile.spaceM2 === "number" && typeof p.footprintM2 === "number" && p.footprintM2 > 0) {
      if (p.footprintM2 > profile.spaceM2 * 1.1) return false;
    }
    if (profile.segment === "physio" && p.medicalCertification?.suitableForRehab === false) {
      // For physio, drop products explicitly marked not-rehab. Keep "unknown" — model can disclaim.
      return false;
    }
    return true;
  });
}

function keywordScore(product: Product, query: string): number {
  if (!query.trim()) return 0;
  const haystack = [
    product.name,
    product.category,
    product.brand,
    product.shortDescription,
    (product.features || []).join(" "),
    (product.tags || []).join(" "),
    (product.targetGroup || []).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  let score = 0;
  for (const t of terms) {
    if (haystack.includes(t)) score += 1;
  }
  return score / Math.max(terms.length, 1);
}

export async function embedQuery(text: string): Promise<number[] | null> {
  if (!HAS_EMBEDDINGS) return null;
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return res.data[0].embedding;
  } catch (err) {
    console.error("embedQuery failed", err);
    return null;
  }
}

export interface RetrievalHit {
  product: Product;
  score: number;
}

/**
 * Retrieve top-K products for a query under a customer profile.
 *
 * Pipeline:
 *   1. Hard filter by profile + explicit filters
 *   2. Score by cosine similarity (if embeddings available) else keyword overlap
 *   3. Return top-K
 *
 * The query embedding is computed once and passed through `queryVector` so
 * a single chat turn can call retrieve() multiple times without re-embedding.
 */
export async function retrieve(opts: {
  query: string;
  profile: CustomerProfile;
  filters?: SearchProductsArgs["filters"];
  limit?: number;
  queryVector?: number[] | null;
}): Promise<RetrievalHit[]> {
  const limit = opts.limit ?? 8;
  const candidates = applyHardFilters(productCatalog, opts.profile, opts.filters);

  let queryVector = opts.queryVector ?? null;
  if (queryVector === undefined) queryVector = null;
  if (HAS_EMBEDDINGS && queryVector === null && opts.query) {
    queryVector = await embedQuery(opts.query);
  }

  const scored: RetrievalHit[] = candidates.map((product) => {
    let score = 0;
    if (queryVector) {
      const v = EMBEDDING_INDEX.get(product.id);
      if (v) score = cosine(queryVector, v);
    }
    if (!queryVector || score === 0) {
      score = keywordScore(product, opts.query);
    }
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Retrieval shim used by the API route on every turn before calling the model.
 * Builds a query string from the latest user message + profile signals so the
 * top-K products in the prompt are biased toward what the user just said.
 */
export async function retrieveForTurn(opts: {
  latestUserMessage: string;
  profile: CustomerProfile;
  limit?: number;
}): Promise<RetrievalHit[]> {
  const profileSignals: string[] = [];
  if (opts.profile.trainingFocus !== "unknown") profileSignals.push(opts.profile.trainingFocus);
  if (opts.profile.experienceLevel !== "unknown") profileSignals.push(opts.profile.experienceLevel);
  if (opts.profile.segment === "physio") profileSignals.push("Reha medizinisch");
  if (opts.profile.segment === "studio") profileSignals.push("Studio gewerblich");
  if (opts.profile.noiseSensitive === true) profileSignals.push("leise");
  const query = [opts.latestUserMessage, ...profileSignals].filter(Boolean).join(" ");

  return retrieve({
    query,
    profile: opts.profile,
    limit: opts.limit ?? 8,
  });
}

export const RETRIEVAL_DEBUG = {
  hasEmbeddings: HAS_EMBEDDINGS,
  vectorCount: EMBEDDING_INDEX.size,
  model: EMBEDDING_MODEL,
};
