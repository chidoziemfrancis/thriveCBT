"use client";

import { motion } from "framer-motion";

export default function EmergencyButton() {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      aria-label="Emergency support"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M6.3 6.3l2.6 2.6M17.7 6.3l-2.6 2.6M6.3 17.7l2.6-2.6M17.7 17.7l-2.6-2.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  );
}
