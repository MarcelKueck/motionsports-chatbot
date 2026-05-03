"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { WelcomeScreen } from "./welcome-screen";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { PersonaDebugStrip } from "./persona-debug-strip";

export function ChatContainer() {
  const { messages, sendMessage, status } = useChat();
  const [debug, setDebug] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasStarted = messages.length > 0;

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read URL once after mount; SSR can't see window
      setDebug(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSuggestionClick = (text: string) => {
    sendMessage({ text });
  };

  // Show typing indicator when submitted but no assistant content yet
  const showTyping =
    status === "submitted" ||
    (status === "streaming" &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {debug && hasStarted && <PersonaDebugStrip messages={messages} />}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-4 py-4">
          {!hasStarted ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {showTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        isLoading={isLoading}
      />
    </div>
  );
}
