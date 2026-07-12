"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "../../../components/SubmitButton";
import {
  PHQ9_QUESTIONS,
  SUICIDAL_IDEATION_INDEX,
  severityBand,
} from "../../_lib/phq9";
import { getAnswers, clearAnswers } from "../../_lib/assessmentStore";

export default function Phq9ResultsPage() {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [needsSupport, setNeedsSupport] = useState(false);

  useEffect(() => {
    const answers = getAnswers();
    const total = answers.reduce((sum, value) => sum + (value ?? 0), 0);
    setScore(total);
    setNeedsSupport((answers[SUICIDAL_IDEATION_INDEX] ?? 0) > 0);
  }, []);

  if (score === null) return null;

  function handleContinue() {
    clearAnswers();
    router.push("/dashboard");
  }

  if (needsSupport) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">
          You&rsquo;re not alone
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          You shared that you&rsquo;ve had thoughts of hurting yourself or
          being better off dead. This matters, and support is available
          right now.
        </p>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-5">
          <p className="text-sm font-medium text-zinc-950">
            Please reach out to one of the following:
          </p>
          <ul className="flex flex-col gap-2 text-sm text-zinc-600">
            <li>Your campus counseling center</li>
            <li>A local crisis helpline</li>
            <li>The research team supporting this study</li>
          </ul>
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton onClick={handleContinue}>Continue</SubmitButton>
        </div>
      </div>
    );
  }

  const band = severityBand(score);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
        Assessment complete
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Thanks for answering honestly. Here&rsquo;s a quick summary of your
        baseline check-in.
      </p>

      <div className="mt-6 rounded-3xl bg-white p-6">
        <p className="text-xs text-zinc-500">Depression severity</p>
        <p className="mt-1 text-3xl font-semibold text-zinc-950">{band}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Score: {score} / {PHQ9_QUESTIONS.length * 3}
        </p>
      </div>

      <div className="mt-auto pb-6">
        <SubmitButton onClick={handleContinue}>
          Start your first session
        </SubmitButton>
      </div>
    </div>
  );
}
