"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "../_components/OnboardingHeader";
import ChoiceButton from "../_components/ChoiceButton";
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
      <OnboardingHeader step={2} totalSteps={4} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
          Are you currently an undergraduate student?
        </h1>

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
