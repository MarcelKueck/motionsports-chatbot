import { ChatContainer } from "@/components/chat/chat-container";

export default function Home() {
  return (
    <div className="flex flex-col h-dvh bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-0.5">
          <span className="text-accent font-bold text-lg">motion</span>
          <span className="text-text-primary font-normal text-lg">sports</span>
        </div>
        <span className="text-[11px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded-full border border-border">
          Prototype
        </span>
      </header>

      {/* Chat */}
      <ChatContainer />
    </div>
  );
}
