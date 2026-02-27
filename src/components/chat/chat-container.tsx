"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { WelcomeScreen } from "./welcome-screen";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";

export function ChatContainer() {
  const { messages, sendMessage, status } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasStarted = messages.length > 0;

  const isLoading = status === "submitted" || status === "streaming";

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
