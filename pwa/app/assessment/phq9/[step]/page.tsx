"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepHeader from "../../../components/StepHeader";
import ChoiceButton from "../../../components/ChoiceButton";
import SubmitButton from "../../../components/SubmitButton";
import { PHQ9_QUESTIONS, PHQ9_OPTIONS } from "../../_lib/phq9";
import { getAnswers, setAnswer } from "../../_lib/assessmentStore";

export default function Phq9QuestionPage() {
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const step = Number(params.step);
  const index = step - 1;

  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const answers = getAnswers();
    setSelected(answers[index] ?? null);
  }, [index]);

  if (Number.isNaN(step) || index < 0 || index >= PHQ9_QUESTIONS.length) {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected === null) return;
    setAnswer(index, selected);

    if (step < PHQ9_QUESTIONS.length) {
      router.push(`/assessment/phq9/${step + 1}`);
    } else {
      router.push("/assessment/phq9/results");
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <StepHeader step={step} totalSteps={PHQ9_QUESTIONS.length} />

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Over the last 2 weeks
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
          {PHQ9_QUESTIONS[index]}
        </h1>

        <div className="mt-6 flex flex-col gap-3">
          {PHQ9_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={selected === option.value}
              onClick={() => setSelected(option.value)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>

        <div className="mt-auto pb-6">
          <SubmitButton disabled={selected === null}>
            {step === PHQ9_QUESTIONS.length ? "Finish" : "Continue"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
