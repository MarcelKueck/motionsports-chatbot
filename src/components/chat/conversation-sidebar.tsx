"use client";

import { useState } from "react";
import { Plus, MessageSquare, Trash2, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConversationSummary } from "@/hooks/use-conversations";

interface Props {
  summaries: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "gerade";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `vor ${days} Tag${days === 1 ? "" : "en"}`;
  const months = Math.floor(days / 30);
  return `vor ${months} Mon`;
}

export function ConversationSidebar({
  summaries,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const inner = (
    <>
      <button
        onClick={() => {
          onCreate();
          setMobileOpen(false);
        }}
        className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-accent text-bg-primary font-medium text-sm hover:bg-accent-hover transition-colors"
      >
        <Plus size={14} /> Neuer Chat
      </button>

      <div className="mt-3 flex-1 overflow-y-auto -mx-1 px-1 space-y-0.5">
        {summaries.length === 0 ? (
          <p className="text-xs text-text-muted px-2 py-6 text-center italic">
            Noch keine Chats
          </p>
        ) : (
          summaries.map((s) => {
            const active = s.id === activeId;
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelect(s.id);
                  setMobileOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(s.id);
                    setMobileOpen(false);
                  }
                }}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  active
                    ? "bg-bg-card border border-border"
                    : "hover:bg-bg-card/60 border border-transparent"
                }`}
              >
                <MessageSquare
                  size={13}
                  className={`shrink-0 ${active ? "text-accent" : "text-text-muted"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-text-primary truncate">
                    {s.title}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {relativeTime(s.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Diesen Chat löschen?")) {
                      onDelete(s.id);
                    }
                  }}
                  aria-label="Chat löschen"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400 shrink-0 p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[10px] text-text-muted/70 mt-3 px-1 leading-tight">
        Chats werden nur in deinem Browser gespeichert.
      </p>
    </>
  );

  return (
    <>
      {/* Mobile open button (header-anchored) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-2.5 left-3 z-30 p-1.5 rounded-lg hover:bg-bg-secondary"
        aria-label="Chats anzeigen"
      >
        <Menu size={18} className="text-text-primary" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-border bg-bg-secondary p-3">
        {inner}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-bg-secondary border-r border-border p-3 flex flex-col"
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Schließen"
                  className="p-1 rounded hover:bg-bg-card"
                >
                  <X size={16} className="text-text-muted" />
                </button>
              </div>
              {inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
