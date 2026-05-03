#!/usr/bin/env node
// Build product embeddings using OpenAI text-embedding-3-small.
// Run: OPENAI_API_KEY=... node scripts/build-embeddings.mjs
//
// Output: src/data/product-embeddings.json
//   { model: string, dim: number, items: [{ id, vector: number[] }] }
//
// Re-run whenever product-catalog.json changes. Safe to run repeatedly:
// it overwrites the existing file. For 1000 products this costs ~$0.001
// total against text-embedding-3-small.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "src/data/product-catalog.json");
const OUT = path.join(ROOT, "src/data/product-embeddings.json");
const MODEL = "text-embedding-3-small";

function buildSearchDoc(p) {
  // Compact representation. Anything we want the embedding to "see" goes here.
  // Keep it short so we don't waste tokens; the retrieved product detail still
  // gets injected into the chat prompt verbatim.
  const lines = [
    `Name: ${p.name}`,
    `Kategorie: ${p.category}`,
    `Marke: ${p.brand}`,
    `Preis: ${p.price} EUR`,
    `Beschreibung: ${p.shortDescription}`,
    `Features: ${(p.features || []).join("; ")}`,
    `Zielgruppe: ${(p.targetGroup || []).join(", ")}`,
    `Tags: ${(p.tags || []).join(", ")}`,
    `Serie: ${p.series || ""}`,
  ];
  if (p.medicalCertification?.suitableForRehab === true) {
    lines.push("Reha-geeignet: ja");
  }
  if (typeof p.noiseLevelDb === "number") {
    lines.push(`Lautstärke: ${p.noiseLevelDb} dB`);
  }
  if (typeof p.footprintM2 === "number" && p.footprintM2 > 0) {
    lines.push(`Stellfläche: ca. ${p.footprintM2} m²`);
  }
  return lines.join("\n");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set");
    process.exit(1);
  }

  const catalog = JSON.parse(await fs.readFile(CATALOG, "utf8"));
  console.log(`Embedding ${catalog.length} products with ${MODEL}…`);

  const client = new OpenAI();
  const docs = catalog.map((p) => buildSearchDoc(p));

  // Batch in chunks of 100 — OpenAI handles up to 2048 inputs per request,
  // 100 keeps memory/error blast radius small.
  const items = [];
  const CHUNK = 100;
  for (let i = 0; i < catalog.length; i += CHUNK) {
    const slice = docs.slice(i, i + CHUNK);
    const ids = catalog.slice(i, i + CHUNK).map((p) => p.id);
    const res = await client.embeddings.create({ model: MODEL, input: slice });
    res.data.forEach((d, idx) => {
      items.push({ id: ids[idx], vector: d.embedding });
    });
    console.log(`  ${Math.min(i + CHUNK, catalog.length)}/${catalog.length}`);
  }

  const dim = items[0].vector.length;
  const out = { model: MODEL, dim, items };
  await fs.writeFile(OUT, JSON.stringify(out));
  console.log(`Wrote ${items.length} vectors (dim=${dim}) → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
