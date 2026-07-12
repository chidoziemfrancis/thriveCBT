"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "./_components/DashboardHeader";
import ContinueSessionCard from "./_components/ContinueSessionCard";
import WeeklyChecklist from "./_components/WeeklyChecklist";
import MoodSnapshot from "./_components/MoodSnapshot";
import JournalShortcut from "./_components/JournalShortcut";
import BottomNav from "./_components/BottomNav";
import { SESSIONS } from "../sessions/_lib/sessions";
import { getOnboardingData } from "../onboarding/_lib/onboardingStore";

const CURRENT_SESSION = 1;

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    setName(getOnboardingData().name ?? "");
  }, []);

  const currentSession = SESSIONS[CURRENT_SESSION - 1];

  const weeklyTasks = [
    {
      label: `Complete Session ${CURRENT_SESSION}: ${currentSession.title}`,
      done: false,
    },
    { label: "Do homework: Thought diary", done: false },
    { label: "Weekly check-in", done: true },
  ];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pb-24 pt-6">
      <DashboardHeader name={name} />

      <div className="mt-6 flex flex-col gap-4">
        <ContinueSessionCard
          sessionNumber={CURRENT_SESSION}
          totalSessions={SESSIONS.length}
          title={currentSession.title}
          onResume={() => router.push(`/sessions/${CURRENT_SESSION}`)}
        />
        <WeeklyChecklist tasks={weeklyTasks} />
        <MoodSnapshot />
        <JournalShortcut />
      </div>

      <BottomNav active="Home" />
    </div>
  );
}
