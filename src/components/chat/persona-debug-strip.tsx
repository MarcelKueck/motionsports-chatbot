"use client";

import { type UIMessage } from "ai";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import {
  EMPTY_PROFILE,
  type CustomerProfile,
  type UpdateCustomerProfileArgs,
} from "@/lib/types";
import { ARCHETYPE_META, deriveArchetype } from "@/lib/persona";

function mergeProfile(
  prev: CustomerProfile,
  patch: UpdateCustomerProfileArgs
): CustomerProfile {
  return {
    segment: patch.segment ?? prev.segment,
    experienceLevel: patch.experienceLevel ?? prev.experienceLevel,
    trainingFocus: patch.trainingFocus ?? prev.trainingFocus,
    spaceM2: patch.spaceM2 ?? prev.spaceM2,
    budgetEUR: patch.budgetEUR ?? prev.budgetEUR,
    trainingFrequency: patch.trainingFrequency ?? prev.trainingFrequency,
    housing: patch.housing ?? prev.housing,
    noiseSensitive: patch.noiseSensitive ?? prev.noiseSensitive,
    procurementNeeds: patch.procurementNeeds ?? prev.procurementNeeds,
    confidence: patch.confidence ?? prev.confidence,
  };
}

function extractProfile(messages: UIMessage[]): CustomerProfile {
  let profile: CustomerProfile = { ...EMPTY_PROFILE };
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts ?? []) {
      const t = part.type;
      if (
        t !== "tool-update_customer_profile" &&
        !t.startsWith("tool-update_customer_profile")
      ) {
        continue;
      }
      const tp = part as { input?: UpdateCustomerProfileArgs };
      if (!tp.input) continue;
      profile = mergeProfile(profile, tp.input);
    }
  }
  return profile;
}

interface PersonaDebugStripProps {
  messages: UIMessage[];
}

export function PersonaDebugStrip({ messages }: PersonaDebugStripProps) {
  const profile = useMemo(() => extractProfile(messages), [messages]);
  const archetype = useMemo(() => deriveArchetype(profile), [profile]);
  const archetypeMeta = ARCHETYPE_META[archetype];

  const knownFields: Array<[string, string]> = [];
  if (profile.segment !== "unknown") knownFields.push(["segment", profile.segment]);
  if (profile.experienceLevel !== "unknown")
    knownFields.push(["level", profile.experienceLevel]);
  if (profile.trainingFocus !== "unknown")
    knownFields.push(["focus", profile.trainingFocus]);
  if (profile.spaceM2 !== "unknown")
    knownFields.push(["space", `${profile.spaceM2} m²`]);
  if (profile.budgetEUR !== "unknown") {
    const b = profile.budgetEUR;
    if (b) {
      knownFields.push([
        "budget",
        `${b.min ?? "?"}–${b.max ?? "?"} €`,
      ]);
    }
  }
  if (profile.trainingFrequency !== "unknown")
    knownFields.push(["freq", profile.trainingFrequency]);
  if (profile.housing !== "unknown") knownFields.push(["housing", profile.housing]);
  if (profile.noiseSensitive !== "unknown")
    knownFields.push(["noise", profile.noiseSensitive ? "ja" : "nein"]);
  if (profile.procurementNeeds.length > 0)
    knownFields.push(["procurement", profile.procurementNeeds.join(",")]);

  const archetypeColor =
    archetype === "unknown"
      ? "bg-text-muted/15 text-text-muted border-text-muted/20"
      : archetype === "studio_operator" ||
          archetype === "public_sector" ||
          archetype === "physio"
        ? "bg-purple-500/15 text-purple-300 border-purple-400/30"
        : "bg-accent/15 text-accent border-accent/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border bg-bg-secondary/60 backdrop-blur-sm"
    >
      <div className="max-w-[720px] mx-auto px-4 py-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="flex items-center gap-1 text-text-muted">
          <Eye size={11} />
          DEBUG
        </span>
        <span
          className={`px-2 py-0.5 rounded-full border ${archetypeColor}`}
          title={`Archetype: ${archetype}`}
        >
          {archetypeMeta.label}
        </span>
        <span className="text-text-muted">
          conf {profile.confidence.toFixed(2)}
        </span>
        <span className="text-text-muted">·</span>
        {knownFields.length === 0 ? (
          <span className="text-text-muted italic">
            keine Profilsignale erkannt
          </span>
        ) : (
          knownFields.map(([k, v]) => (
            <span
              key={k}
              className="px-1.5 py-0.5 rounded bg-bg-card border border-border text-text-secondary"
            >
              <span className="text-text-muted">{k}:</span> {v}
            </span>
          ))
        )}
      </div>
    </motion.div>
  );
}
