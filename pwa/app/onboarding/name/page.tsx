"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "../_components/OnboardingHeader";
import PillInput from "../../components/PillInput";
import SubmitButton from "../../components/SubmitButton";
import { setOnboardingData } from "../_lib/onboardingStore";

export default function OnboardingNamePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOnboardingData({ name: name.trim() });
    router.push("/onboarding/eligibility");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <OnboardingHeader step={1} totalSteps={4} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
          What should we call you?
        </h1>

        <div className="mt-6">
          <PillInput
            name="name"
            autoComplete="given-name"
            placeholder="Your first name"
            value={name}
            onChange={setName}
          />
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton disabled={name.trim().length === 0}>
            Continue
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
