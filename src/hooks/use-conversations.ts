"use client";

import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import {
  deleteOne,
  deriveTitle,
  loadAll,
  newConversationId,
  saveOne,
  type StoredConversation,
} from "@/lib/conversations";

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: number;
  messageCount: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount. Activate most recent if any exist.
  useEffect(() => {
    const all = loadAll();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration from localStorage; SSR can't read it
    setConversations(all);
    if (all.length > 0) setActiveId(all[0].id);
    setIsLoaded(true);
  }, []);

  const createNew = useCallback(() => {
    const id = newConversationId();
    setActiveId(id);
    return id;
  }, []);

  const remove = useCallback(
    (id: string) => {
      deleteOne(id);
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        // If the deleted conversation was active, switch to the next most recent.
        if (id === activeId) {
          setActiveId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeId]
  );

  const updateMessages = useCallback((id: string, messages: UIMessage[]) => {
    if (messages.length === 0) return;
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === id);
      const now = Date.now();
      const conv: StoredConversation = {
        id,
        title: existing?.title || deriveTitle(messages),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        messages,
      };
      saveOne(conv);
      const others = prev.filter((c) => c.id !== id);
      return [conv, ...others].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  const summaries: ConversationSummary[] = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
  }));

  const activeMessages: UIMessage[] = activeId
    ? (conversations.find((c) => c.id === activeId)?.messages ?? [])
    : [];

  return {
    summaries,
    activeId,
    activeMessages,
    setActiveId,
    createNew,
    remove,
    updateMessages,
    isLoaded,
  };
}
