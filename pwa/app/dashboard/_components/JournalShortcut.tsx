"use client";

import { motion } from "framer-motion";

export default function JournalShortcut() {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="flex items-center gap-4 rounded-3xl bg-white p-5 text-left"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 4h9l3 3v13H6V4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 10h6M9 14h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-950">Journal</p>
        <p className="text-xs text-zinc-500">Reflect on your week</p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5l7 7-7 7"
          stroke="#a1a1aa"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
