"use client";

import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  {
    emoji: "🏋️",
    label: "Home Gym einrichten",
    message: "Ich möchte mir ein Home Gym einrichten. Kannst du mich beraten?",
  },
  {
    emoji: "💪",
    label: "Power Racks vergleichen",
    message:
      "Welche Power Racks habt ihr und worin unterscheiden sie sich?",
  },
  {
    emoji: "🏃",
    label: "Cardiogeräte beraten",
    message: "Ich suche ein gutes Cardiogerät für Zuhause.",
  },
  {
    emoji: "🎁",
    label: "Geschenk finden",
    message:
      "Ich suche ein Geschenk für jemanden der gerne trainiert.",
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-1 mb-6">
        <span className="text-accent font-bold text-3xl">motion</span>
        <span className="text-text-primary font-normal text-3xl">sports</span>
      </div>

      {/* Greeting */}
      <h1 className="text-xl font-semibold text-text-primary mb-2">
        Hallo! 👋 Ich bin dein Fitnessberater bei motion sports.
      </h1>
      <p className="text-text-secondary text-sm max-w-md mb-8">
        Ich kenne unser Sortiment in- und auswendig und helfe dir, das perfekte
        Equipment zu finden.
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.08 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSuggestionClick(suggestion.message)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-bg-card text-text-primary text-sm hover:border-border-hover hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <span>{suggestion.emoji}</span>
            <span>{suggestion.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
