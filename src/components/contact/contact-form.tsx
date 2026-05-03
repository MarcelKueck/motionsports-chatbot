"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const REASON_LABELS: Record<string, string> = {
  studio_consultation: "Studio-Beratung",
  public_sector_quote: "Angebot für öffentliche Einrichtung",
  physio_consultation: "Physio / Reha-Beratung",
  bulk_discount: "Mengenrabatt-Anfrage",
  leasing: "Leasing-Anfrage",
  maintenance: "Wartungsvertrag",
  general: "Allgemeine Anfrage",
};

export function ContactForm() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "general";
  const productIds = params.get("products") ?? "";
  const initialMessage = params.get("message") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMessage && !message) setMessage(initialMessage);
  }, [initialMessage, message]);

  const reasonLabel = REASON_LABELS[reason] ?? "Anfrage";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          productIds: productIds ? productIds.split(",").filter(Boolean) : [],
          name,
          email,
          organization,
          phone,
          message,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Übermittlung fehlgeschlagen");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border rounded-xl p-6 text-center space-y-3"
      >
        <CheckCircle2 className="text-accent mx-auto" size={36} />
        <h2 className="text-lg font-semibold text-text-primary">
          Vielen Dank!
        </h2>
        <p className="text-sm text-text-secondary">
          Wir haben deine Anfrage erhalten und melden uns innerhalb von 1-2
          Werktagen.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} /> Zurück zum Chat
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary mb-3"
        >
          <ArrowLeft size={12} /> Zurück zum Chat
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">
          Persönliche Beratung
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Anfrage-Typ:{" "}
          <span className="text-accent font-medium">{reasonLabel}</span>
        </p>
        {productIds && (
          <p className="text-xs text-text-muted mt-1 font-mono">
            Bezug: {productIds}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-card border border-border rounded-xl p-5 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Name *" required value={name} onChange={setName} />
          <Field
            label="E-Mail *"
            required
            type="email"
            value={email}
            onChange={setEmail}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label={
              reason === "studio_consultation" ||
              reason === "public_sector_quote"
                ? "Organisation / Studio *"
                : "Organisation"
            }
            required={
              reason === "studio_consultation" ||
              reason === "public_sector_quote"
            }
            value={organization}
            onChange={setOrganization}
          />
          <Field
            label="Telefon"
            type="tel"
            value={phone}
            onChange={setPhone}
          />
        </div>

        <label className="block">
          <span className="text-xs text-text-secondary">Nachricht *</span>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Beschreibe kurz dein Anliegen…"
            className="mt-1 block w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </label>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-bg-primary font-semibold text-sm rounded-lg transition-colors"
        >
          {submitting ? "Wird gesendet…" : "Anfrage senden"}
        </button>

        <p className="text-[11px] text-text-muted text-center">
          Wir melden uns innerhalb von 1-2 Werktagen. Deine Daten werden nur für
          die Bearbeitung deiner Anfrage verwendet.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-text-secondary">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
      />
    </label>
  );
}
