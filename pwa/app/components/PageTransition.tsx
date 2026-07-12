"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex flex-1 flex-col">
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col overflow-y-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
