"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepHeader from "../../components/StepHeader";
import ChoiceButton from "../../components/ChoiceButton";
import SubmitButton from "../../components/SubmitButton";
import { setOnboardingData } from "../_lib/onboardingStore";

export default function OnboardingEligibilityPage() {
  const router = useRouter();
  const [isUndergraduate, setIsUndergraduate] = useState<boolean | null>(
    null
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUndergraduate === null) return;
    setOnboardingData({ isUndergraduate });
    router.push("/onboarding/what-to-expect");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <StepHeader step={3} totalSteps={4} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
          Are you currently an undergraduate student?
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          We ask this to confirm you&rsquo;re eligible to take part in this
          study.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <ChoiceButton
            selected={isUndergraduate === true}
            onClick={() => setIsUndergraduate(true)}
          >
            Yes
          </ChoiceButton>
          <ChoiceButton
            selected={isUndergraduate === false}
            onClick={() => setIsUndergraduate(false)}
          >
            No
          </ChoiceButton>
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton disabled={isUndergraduate === null}>
            Continue
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
