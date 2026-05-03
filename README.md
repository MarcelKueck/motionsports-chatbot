# motion sports — KI-Fitnessberater

Persona-aware Sales-Chatbot für motionsports.de, gebaut mit Next.js + Vercel AI SDK.

## Features

- **Persona-Erkennung**: Strukturiertes Customer-Profile wird live aus dem Chat extrahiert. Daraus wird ein Archetyp abgeleitet (Pragmatischer Einsteiger, Ambitionierter Home-Athlet, Kraftsportler, Cardio, Studiobetreiber, Physio, Öffentliche Hand). Der System-Prompt wird pro Archetyp angepasst.
- **RAG (Retrieval-Augmented Generation)**: Produkte werden mit OpenAI `text-embedding-3-small` indexiert und pro Turn nach semantischer Ähnlichkeit + Profilfilter retrieved. Skaliert auf 1000+ Produkte ohne Token-Explosion. Fallback auf Keyword-Suche, wenn kein Embedding-Index vorhanden ist.
- **Tools**: `update_customer_profile` (silent), `search_products`, `show_product`, `compare_products`, `add_to_cart` (B2C), `suggest_showroom`, `show_contact_form` (B2B / Spezialfälle).
- **Kontaktformular**: Eigenes Routing für Studio-, Reha- und Behörden-Anfragen mit prefilled Context aus dem Chat.
- **Debug-Modus**: `?debug=1` an der URL anhängen — zeigt Live-Profil, Archetyp und alle silent Tool Calls.

## Setup

```bash
npm install

# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...     # nur für den Indexer benötigt; der Chat funktioniert auch ohne
```

## Embeddings indexieren

Die Embeddings werden einmalig mit dem Indexer-Skript erzeugt und committed (statisches JSON, ~6 MB für 1000 Produkte). Skript erneut ausführen wenn der Katalog geändert wurde.

```bash
npm run index
```

Output: `src/data/product-embeddings.json`. Solange diese Datei keine Vektoren enthält, fällt das System automatisch auf Keyword-Suche zurück.

## Lokal starten

```bash
npm run dev
```

Chat: http://localhost:3000
Mit Debug-Strip: http://localhost:3000/?debug=1

## Auf Vercel deployen

1. ANTHROPIC_API_KEY und OPENAI_API_KEY als Environment-Variables setzen.
2. Vor dem Deploy: `npm run index` lokal ausführen und `src/data/product-embeddings.json` committen.

## Architektur

```
src/
├── app/
│   ├── api/chat/route.ts          # Chat-Endpoint: extract profile → retrieve → stream
│   ├── api/contact/route.ts       # Form-Submission (loggt aktuell nur)
│   └── contact/page.tsx           # Kontaktformular
├── components/
│   ├── chat/                      # ChatContainer, MessageBubble, PersonaDebugStrip
│   ├── tools/                     # ProductCard, Compare, AddToCart, Showroom, ContactFormCard
│   └── contact/                   # Form-Logik
├── data/
│   ├── product-catalog.json
│   └── product-embeddings.json    # generiert via `npm run index`
└── lib/
    ├── persona.ts                 # deriveArchetype, addendums, profile rendering
    ├── retrieval.ts               # cosine retrieval + keyword fallback
    ├── system-prompt.ts           # baut den per-turn System-Prompt
    ├── tools.ts                   # alle Chat-Tools
    └── types.ts                   # Profile, Archetype, Product etc.
```

## Persona-Architektur

Das Profil ist **eine pure Funktion der Message-History**. Bei jedem Turn werden alle `update_customer_profile`-Tool-Calls aus dem Stream gemerged — kein separater Session-Storage. Der Archetyp wird aus dem Profil abgeleitet (siehe `deriveArchetype`). System-Prompt + Retrieval werden mit dem aktuellen Profil parametriert; alle Empfehlungen sind damit persona-aware.
