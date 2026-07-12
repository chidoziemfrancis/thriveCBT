"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "../_components/OnboardingHeader";
import LabeledField from "../../components/LabeledField";
import SubmitButton from "../../components/SubmitButton";
import { setOnboardingData } from "../_lib/onboardingStore";

export default function OnboardingDobPage() {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOnboardingData({ dateOfBirth });
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

        <div className="mt-6">
          <LabeledField
            label="Birthday"
            name="dateOfBirth"
            type="date"
            autoComplete="bday"
            value={dateOfBirth}
            onChange={setDateOfBirth}
          />
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton disabled={dateOfBirth.trim().length === 0}>
            Continue
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
