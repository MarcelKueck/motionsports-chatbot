"use client";

import { useState, useRef, useCallback } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-bg-secondary shrink-0">
      <div className="max-w-[720px] mx-auto px-4 py-3">
        <div className="flex items-end gap-2 bg-bg-card border border-border rounded-2xl px-4 py-2 focus-within:border-border-hover transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Frag mich etwas über unser Sortiment..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none outline-none max-h-[120px] py-1 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover text-bg-primary transition-colors disabled:opacity-30 disabled:hover:bg-accent shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
        <p className="text-[11px] text-text-muted text-center mt-2">
          KI-Fitnessberater – Antworten können Fehler enthalten
        </p>
      </div>
    </div>
  );
}
