export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-bg-assistant-bubble rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
          <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
          <span className="typing-dot w-2 h-2 rounded-full bg-text-muted" />
        </div>
      </div>
    </div>
  );
}
