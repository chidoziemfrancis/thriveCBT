"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import EmergencyButton from "./EmergencyButton";

export default function DashboardHeader({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between"
    >
      <Link href="/profile" className="flex items-center gap-3">
        <Avatar name={name || "?"} size={36} />
        <p className="text-lg font-semibold text-zinc-950">
          Hi, {name || "there"} 👋
        </p>
      </Link>
      <EmergencyButton />
    </motion.div>
  );
}
