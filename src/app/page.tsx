"use client";

import { useEffect } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { useConversations } from "@/hooks/use-conversations";

export default function Home() {
  const {
    summaries,
    activeId,
    activeMessages,
    setActiveId,
    createNew,
    remove,
    updateMessages,
    isLoaded,
  } = useConversations();

  // Once storage has loaded, ensure there's an active conversation.
  // If none exist (first visit, all deleted), spin up a fresh one.
  useEffect(() => {
    if (isLoaded && !activeId) {
      createNew();
    }
  }, [isLoaded, activeId, createNew]);

  return (
    <div className="flex h-dvh bg-bg-primary">
      {isLoaded && (
        <ConversationSidebar
          summaries={summaries}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createNew}
          onDelete={remove}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0 bg-bg-secondary">
          {/* Left padding on mobile so the hamburger button doesn't collide with the logo */}
          <div className="flex items-center gap-0.5 ml-9 md:ml-0">
            <span className="text-accent font-bold text-lg">motion</span>
            <span className="text-accent font-normal text-lg">sports</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded-full border border-border">
            Prototype
          </span>
        </header>

        {activeId && (
          <ChatContainer
            // Remount on conversation switch so useChat re-initializes cleanly.
            key={activeId}
            initialMessages={activeMessages}
            onMessagesChange={(msgs) => updateMessages(activeId, msgs)}
          />
        )}
      </div>
    </div>
  );
}
