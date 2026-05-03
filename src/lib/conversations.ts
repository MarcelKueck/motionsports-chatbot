import type { UIMessage } from "ai";

const STORAGE_KEY = "ms-conversations-v1";

export interface StoredConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
}

interface StorageShape {
  version: 1;
  conversations: StoredConversation[];
}

function readStore(): StorageShape {
  if (typeof window === "undefined") return { version: 1, conversations: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, conversations: [] };
    const parsed = JSON.parse(raw) as Partial<StorageShape>;
    if (parsed?.version === 1 && Array.isArray(parsed.conversations)) {
      return { version: 1, conversations: parsed.conversations };
    }
  } catch {
    // corrupted JSON or quota error — start fresh
  }
  return { version: 1, conversations: [] };
}

function writeStore(store: StorageShape) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — silently drop. Could add eviction later.
  }
}

export function loadAll(): StoredConversation[] {
  return [...readStore().conversations].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveOne(conv: StoredConversation): void {
  const store = readStore();
  const idx = store.conversations.findIndex((c) => c.id === conv.id);
  if (idx >= 0) store.conversations[idx] = conv;
  else store.conversations.push(conv);
  writeStore(store);
}

export function deleteOne(id: string): void {
  const store = readStore();
  store.conversations = store.conversations.filter((c) => c.id !== id);
  writeStore(store);
}

export function newConversationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "c-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Derive a title from the first user message. Truncate to 40 chars.
export function deriveTitle(messages: UIMessage[]): string {
  for (const m of messages) {
    if (m.role !== "user") continue;
    const text = (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join(" ")
      .trim();
    if (text) {
      return text.length > 40 ? text.slice(0, 40).trim() + "…" : text;
    }
  }
  return "Neuer Chat";
}
