import type {
  ArchetypeMeta,
  CustomerProfile,
  PersonaArchetype,
} from "./types";

/**
 * Derive a single persona archetype from the structured profile.
 * The profile is the source of truth — archetype is just a "view" used to
 * pick a tailored consulting style. When signals conflict we fall back to
 * `unknown` rather than guessing wrong.
 */
export function deriveArchetype(profile: CustomerProfile): PersonaArchetype {
  // B2B segments take precedence — different consulting style entirely.
  if (profile.segment === "public_sector") return "public_sector";
  if (profile.segment === "studio") return "studio_operator";
  if (profile.segment === "physio") return "physio";

  if (profile.segment === "private") {
    // Strength vs cardio focus is the next-most-important axis.
    if (profile.trainingFocus === "strength") return "strength_focused";
    if (profile.trainingFocus === "cardio") return "cardio_focused";

    // Otherwise classify by budget + space + experience — pragmatic vs ambitious.
    const budgetMax =
      typeof profile.budgetEUR === "object" && profile.budgetEUR
        ? profile.budgetEUR.max
        : null;
    const spaceM2 =
      typeof profile.spaceM2 === "number" ? profile.spaceM2 : null;

    const looksAmbitious =
      (budgetMax != null && budgetMax >= 2000) ||
      (spaceM2 != null && spaceM2 >= 15) ||
      profile.experienceLevel === "advanced";
    const looksPragmatic =
      (budgetMax != null && budgetMax < 1500) ||
      (spaceM2 != null && spaceM2 < 12) ||
      profile.experienceLevel === "beginner";

    if (looksAmbitious && !looksPragmatic) return "ambitious_home_athlete";
    if (looksPragmatic && !looksAmbitious) return "pragmatic_beginner";
  }

  return "unknown";
}

export const ARCHETYPE_META: Record<PersonaArchetype, ArchetypeMeta> = {
  pragmatic_beginner: {
    id: "pragmatic_beginner",
    label: "Pragmatischer Einsteiger",
    shortLabel: "Einsteiger",
  },
  ambitious_home_athlete: {
    id: "ambitious_home_athlete",
    label: "Ambitionierter Home-Athlet",
    shortLabel: "Home-Athlet",
  },
  strength_focused: {
    id: "strength_focused",
    label: "Kraftsportler",
    shortLabel: "Kraft",
  },
  cardio_focused: {
    id: "cardio_focused",
    label: "Cardio / Gesundheit",
    shortLabel: "Cardio",
  },
  studio_operator: {
    id: "studio_operator",
    label: "Studiobetreiber",
    shortLabel: "Studio (B2B)",
  },
  physio: {
    id: "physio",
    label: "Physio / Reha",
    shortLabel: "Physio",
  },
  public_sector: {
    id: "public_sector",
    label: "Öffentliche Einrichtung",
    shortLabel: "Öffentlich (B2B)",
  },
  unknown: {
    id: "unknown",
    label: "Noch unbestimmt",
    shortLabel: "?",
  },
};

/**
 * Per-archetype consulting style. Appended to the system prompt once the
 * archetype is known. Keep these short — the model already has the catalog
 * retrieval and base prompt; this just steers tone + focus.
 */
export function getPersonaAddendum(archetype: PersonaArchetype): string {
  switch (archetype) {
    case "pragmatic_beginner":
      return `## Beratungsmodus: Pragmatischer Einsteiger
- Empfiehl maximal 1-2 Produkte pro Antwort, keine Auswahl-Lawine.
- Bevorzuge platzsparende, klappbare oder multifunktionale Lösungen.
- Erwähne IMMER konkret die Stellfläche ("passt auf ca. 2 m²").
- Bei >300€ erkläre kurz das Preis-Leistungs-Verhältnis.
- Nenne Lautstärke wenn relevant (Wohnung).
- Schlage gerne Einsteiger-Bundles vor (z.B. Bank + Kurzhanteln).`;

    case "ambitious_home_athlete":
      return `## Beratungsmodus: Ambitionierter Home-Athlet
- Sprich auf Augenhöhe. Technische Details (Belastbarkeit, Profilstärke, Lager) sind willkommen.
- Empfiehl gerne Komplettsysteme (Rack + Bank + Scheiben + Kabelzug).
- Hebe Erweiterbarkeit und Studio-Qualität hervor.
- Bei Investitionen >2000€: schlage proaktiv den Showroom in Gröbenzell vor.
- Erwähne Markenqualität und Langlebigkeit konkret.`;

    case "strength_focused":
      return `## Beratungsmodus: Kraftsportler
- Fokus: Belastbarkeit, Stabilität, Sicherheit (Spotter, Safeties).
- Erkläre technische Specs konkret (max. Last, Profilstärke, Lagerung).
- Bei Rack-Empfehlungen: erwähne Kompatibilität mit Hantelstange/Scheiben/Bank.
- Nenne Erweiterungsoptionen (Latzug, Multipresse, Storage).
- Vergleiche frei vs. geführt (Multipresse) wenn relevant.`;

    case "cardio_focused":
      return `## Beratungsmodus: Cardio / Gesundheit
- Erwähne IMMER die Lautstärke wenn bekannt (kritisch für Wohnung).
- Hebe gelenkschonendes Training hervor wo zutreffend.
- Vergleiche gerne Laufband vs. Bike vs. Rudergerät kurz.
- Erwähne App-Konnektivität / Programme — Motivation zählt.
- Bei klappbaren Geräten: Maße aufgeklappt UND zusammengeklappt erwähnen.`;

    case "studio_operator":
      return `## Beratungsmodus: Studiobetreiber (B2B)
- Du bist hier KEIN Verkäufer für Einzelstücke — du bist Brückenbau zum B2B-Team.
- Stelle gezielte Rückfragen zu Studiogröße, Konzept, Stückzahlen.
- Bei klarem B2B-Bedarf (Mengenrabatt, Lieferung, Wartung, Konzept): nutze show_contact_form mit reason="studio_consultation".
- Du DARFST einzelne Produkte zeigen als Referenz, aber pushe nicht add_to_cart.
- Hebe Dauerbetriebs-Tauglichkeit, Wartungsarmut und Belastbarkeit hervor.
- Beziehung > Produkt. Persönlicher Ansprechpartner ist der Kern.`;

    case "physio":
      return `## Beratungsmodus: Physio / Reha
- Vertrauen und Sicherheit stehen über allem. KEINE Marketing-Sprache.
- Sei EHRLICH: Unsere Geräte sind Sportgeräte (EN 20957), keine Medizinprodukte (MDR).
  Wenn der Kunde echte CE-Klasse-IIa-Geräte braucht, sag das klar und nutze show_contact_form mit reason="physio_consultation".
- Frage nach Einsatzgebiet (Senioren? Sport-Reha? Orthopädie?) bevor du empfiehlst.
- Bevorzuge Geräte mit feiner Widerstandseinstellung.
- Erwähne KEINE medizinischen Wirkversprechen.
- Bei jedem empfohlenen Produkt: kurzen Hinweis zum Reha-Einsatzgebiet (z.B. "wird häufig in der Reha genutzt, ist aber kein Medizinprodukt").`;

    case "public_sector":
      return `## Beratungsmodus: Öffentliche Einrichtung (B2B)
- Sprich formal, aber freundlich. Bürokratie respektieren, nicht beschönigen.
- Bei jedem konkreten Beschaffungssignal (Angebot, Rechnung, Ausschreibung, Zahlungsziel, CE-Doku): nutze show_contact_form mit reason="public_sector_quote".
- Erwähne, dass Kauf auf Rechnung und formelle PDF-Angebote möglich sind.
- Erwähne CE-Konformität und Normen (z.B. EN 20957) wo relevant.
- Liefertermine und Ersatzteilverfügbarkeit explizit ansprechen.
- Erwähne langfristige Wartungsverträge als Option (über das B2B-Team).`;

    case "unknown":
    default:
      return `## Beratungsmodus: Noch unbestimmt
- Stelle 1-2 Rückfragen um den Kunden besser einzuordnen.
- Hilfreiche Klassifikatoren: Privat oder Studio? Kraft oder Cardio? Budget? Wohnsituation?
- Stelle Fragen einzeln im Gesprächsverlauf, nicht als Checkliste.
- Sobald du klare Signale erkennst, rufe update_customer_profile auf.`;
  }
}

/**
 * Render the structured profile as a compact block for the system prompt,
 * so the model always sees what it knows about the customer.
 */
export function renderProfileForPrompt(profile: CustomerProfile): string {
  const lines: string[] = ["## Aktuelles Kundenprofil"];
  lines.push(`- Segment: ${profile.segment}`);
  lines.push(`- Erfahrungslevel: ${profile.experienceLevel}`);
  lines.push(`- Trainingsfokus: ${profile.trainingFocus}`);
  lines.push(
    `- Platz: ${profile.spaceM2 === "unknown" ? "unbekannt" : `${profile.spaceM2} m²`}`
  );
  lines.push(
    `- Budget: ${
      profile.budgetEUR === "unknown"
        ? "unbekannt"
        : `${profile.budgetEUR.min ?? "?"} - ${profile.budgetEUR.max ?? "?"} €`
    }`
  );
  lines.push(`- Trainingsfrequenz: ${profile.trainingFrequency}`);
  lines.push(`- Wohnsituation: ${profile.housing}`);
  lines.push(
    `- Geräuschempfindlich: ${
      profile.noiseSensitive === "unknown" ? "unbekannt" : profile.noiseSensitive ? "ja" : "nein"
    }`
  );
  if (profile.procurementNeeds.length > 0) {
    lines.push(`- Beschaffungsbedarf: ${profile.procurementNeeds.join(", ")}`);
  }
  lines.push(`- Confidence: ${profile.confidence.toFixed(2)}`);
  return lines.join("\n");
}
