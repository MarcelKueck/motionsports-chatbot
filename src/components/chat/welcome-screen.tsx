"use client";

import { motion } from "framer-motion";

// Welcome screen kept intentionally minimal: just the logo + a one-line
// greeting. No preconfigured suggestion chips per client direction — testers
// should explore freely with their own questions.
export function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="flex items-center gap-1 mb-7">
        <span className="text-accent font-bold text-4xl tracking-tight">motion</span>
        <span className="text-accent font-light text-4xl tracking-tight">sports</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3 tracking-tight">
        Wie kann ich dir helfen?
      </h1>
      <p className="text-text-secondary text-sm md:text-base max-w-md">
        Frag mich nach Empfehlungen, vergleiche Produkte oder beschreib einfach
        deine Trainingssituation.
      </p>
    </motion.div>
  );
}
