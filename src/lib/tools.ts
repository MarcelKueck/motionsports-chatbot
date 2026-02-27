import { tool } from "ai";
import { z } from "zod";

export const chatTools = {
  show_product: tool({
    description:
      "Zeigt eine Produktkarte im Chat an. Nutze dieses Tool wenn du ein Produkt empfiehlst oder der Kunde nach einem bestimmten Produkt fragt. Nutze es für jedes Produkt das du erwähnst.",
    inputSchema: z.object({
      productId: z.string().describe("Die ID des Produkts aus dem Katalog"),
      reason: z
        .string()
        .optional()
        .describe("Kurze Begründung warum dieses Produkt passt (1-2 Sätze)"),
    }),
  }),

  compare_products: tool({
    description:
      "Zeigt einen Produktvergleich als Tabelle an. Nutze dieses Tool wenn der Kunde zwei oder mehr Produkte vergleichen möchte, nach Unterschieden fragt, oder du Alternativen gegenüberstellen willst.",
    inputSchema: z.object({
      productIds: z
        .array(z.string())
        .min(2)
        .max(3)
        .describe("Array mit 2-3 Produkt-IDs"),
      comparisonContext: z
        .string()
        .optional()
        .describe(
          "Kontext des Vergleichs z.B. 'Preis-Leistung für Einsteiger'"
        ),
    }),
  }),

  add_to_cart: tool({
    description:
      "Zeigt einen 'In den Warenkorb' Button. NUR nutzen wenn der Kunde KLARE Kaufbereitschaft zeigt — z.B. 'Das nehme ich', 'Wie bestelle ich?', 'Perfekt, das will ich'. NIEMALS proaktiv ohne Kaufsignal einsetzen.",
    inputSchema: z.object({
      productId: z.string().describe("Die ID des Produkts"),
      message: z
        .string()
        .describe("Positive Bestätigungsnachricht, z.B. 'Super Wahl!'"),
    }),
  }),

  suggest_showroom: tool({
    description:
      "Schlägt einen Besuch im Showroom in Gröbenzell bei München vor. Nutzen wenn der Kunde bei teuren Geräten (über 500€) unsicher ist oder Produkte vor dem Kauf testen möchte.",
    inputSchema: z.object({
      productIds: z
        .array(z.string())
        .describe("Produkte die im Showroom getestet werden können"),
    }),
  }),
};
