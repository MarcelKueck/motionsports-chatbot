import { Suspense } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <header className="flex items-center justify-between px-4 h-12 border-b border-border bg-bg-secondary">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-accent font-bold text-lg">motion</span>
          <span className="text-text-primary font-normal text-lg">sports</span>
        </Link>
        <span className="text-[11px] font-mono text-text-muted bg-bg-card px-2 py-0.5 rounded-full border border-border">
          Kontakt
        </span>
      </header>

      <main className="max-w-[640px] mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-text-muted">Lade…</div>}>
          <ContactForm />
        </Suspense>
      </main>
    </div>
  );
}
