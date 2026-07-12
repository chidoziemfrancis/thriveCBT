"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "../_components/OnboardingHeader";
import DateWheelPicker, { DateValue } from "../../components/DateWheelPicker";
import SubmitButton from "../../components/SubmitButton";
import { setOnboardingData } from "../_lib/onboardingStore";

function defaultDate(): DateValue {
  return { day: 1, month: 0, year: new Date().getFullYear() - 20 };
}

export default function OnboardingDobPage() {
  const router = useRouter();
  const [date, setDate] = useState<DateValue>(defaultDate);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const iso = `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    setOnboardingData({ dateOfBirth: iso });
    router.push("/onboarding/eligibility");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <OnboardingHeader step={2} totalSteps={4} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
          When&rsquo;s your birthday?
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          We use this to confirm you meet the age requirements for this
          study. It won&rsquo;t be shown publicly.
        </p>

        <p className="mt-6 text-sm text-zinc-500">Birthday</p>
        <div className="mt-2">
          <DateWheelPicker value={date} onChange={setDate} />
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton>Continue</SubmitButton>
        </div>
      </form>
    </div>
  );
}
