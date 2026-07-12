"use client";

import { motion } from "framer-motion";
import ChecklistRow from "./ChecklistRow";

export type ChecklistTask = {
  label: string;
  done: boolean;
};

export default function WeeklyChecklist({
  tasks,
}: {
  tasks: ChecklistTask[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-3xl bg-white p-5"
    >
      <p className="text-sm font-semibold text-zinc-950">This week</p>
      <div className="mt-3 flex flex-col gap-3">
        {tasks.map((task) => (
          <ChecklistRow key={task.label} {...task} />
        ))}
      </div>
    </motion.div>
  );
}
