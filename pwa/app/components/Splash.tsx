"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

export default function Splash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-semibold tracking-tight text-white"
            >
              Thrive<span className="text-white/60">CBT</span>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
