"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { emoji: "😞", label: "Low" },
  { emoji: "😕", label: "Down" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😄", label: "Great" },
];

export default function MoodSnapshot() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-3xl bg-white p-5"
    >
      <AnimatePresence mode="wait">
        {selected === null ? (
          <motion.div key="prompt" exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-zinc-950">
              How are you feeling today?
            </p>
            <div className="mt-4 flex justify-between">
              {MOODS.map((mood, index) => (
                <motion.button
                  key={mood.label}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelected(index)}
                  aria-label={mood.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-xl"
                >
                  {mood.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">{MOODS[selected].emoji}</span>
            <p className="text-sm text-zinc-500">
              Thanks for checking in — logged as{" "}
              <span className="font-medium text-zinc-950">
                {MOODS[selected].label}
              </span>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
