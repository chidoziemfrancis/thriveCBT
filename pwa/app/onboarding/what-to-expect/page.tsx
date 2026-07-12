"use client";

import { useRouter } from "next/navigation";
import StepHeader from "../../components/StepHeader";
import TimelineItem from "../_components/TimelineItem";
import {
  ChecklistIcon,
  SessionsIcon,
  CheckinIcon,
  FinishFlagIcon,
} from "../_components/TimelineIcons";
import SubmitButton from "../../components/SubmitButton";

const TIMELINE = [
  {
    title: "Complete Assessments",
    icon: <ChecklistIcon />,
    iconBg: "bg-indigo-500",
  },
  {
    title: "8 CBT Sessions",
    icon: <SessionsIcon />,
    iconBg: "bg-violet-500",
  },
  {
    title: "Weekly Check-ins",
    icon: <CheckinIcon />,
    iconBg: "bg-teal-500",
  },
  {
    title: "Final Assessment",
    icon: <FinishFlagIcon />,
    iconBg: "bg-amber-500",
  },
];

export default function WhatToExpectPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <StepHeader step={4} totalSteps={4} />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        What to expect
      </h1>

      <div className="mt-8 flex flex-col">
        {TIMELINE.map((item, index) => (
          <TimelineItem
            key={item.title}
            icon={item.icon}
            iconBg={item.iconBg}
            title={item.title}
            isLast={index === TIMELINE.length - 1}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-100 px-4 py-3">
        <p className="text-xs text-zinc-500">Estimated time</p>
        <p className="mt-0.5 text-sm font-medium text-zinc-950">
          15–20 minutes per week
        </p>
      </div>

      <div className="mt-auto pb-6">
        <SubmitButton onClick={() => router.push("/dashboard")}>
          Continue
        </SubmitButton>
      </div>
    </div>
  );
}
