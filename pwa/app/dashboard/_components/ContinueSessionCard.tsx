"use client";

import { motion } from "framer-motion";

export default function ContinueSessionCard({
  sessionNumber,
  totalSessions,
  title,
}: {
  sessionNumber: number;
  totalSessions: number;
  title: string;
}) {
  const percent = Math.round((sessionNumber / totalSessions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-3xl bg-zinc-950 p-5 text-white"
    >
      <p className="text-xs text-white/60">
        Session {sessionNumber} of {totalSessions}
      </p>
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-white"
        />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-medium text-zinc-950"
      >
        Resume session
      </motion.button>
    </motion.div>
  );
}
