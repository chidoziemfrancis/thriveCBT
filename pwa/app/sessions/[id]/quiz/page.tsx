"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "../../../components/BackButton";
import SubmitButton from "../../../components/SubmitButton";
import { completeModule } from "../../_lib/sessionProgress";

const QUIZ = [
  {
    question:
      "Depression is the same as ordinary sadness that passes quickly.",
    options: ["True", "False"],
  },
  {
    question: "Which of these can be affected by depression?",
    options: ["Sleep and appetite", "Only your mood", "Nothing physical"],
  },
  {
    question:
      "Academic stress can be a contributing cause of depression in undergraduates.",
    options: ["True", "False"],
  },
];

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const allAnswered = QUIZ.every((_, index) => answers[index] !== undefined);

  function handleContinue() {
    completeModule(id, "quiz");
    router.push(`/sessions/${id}/journal`);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        Quick quiz
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Let&rsquo;s check what stuck from what you just read.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {QUIZ.map((item, index) => (
          <div key={item.question}>
            <p className="text-sm font-medium text-zinc-950">
              {item.question}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {item.options.map((option) => {
                const selected = answers[index] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [index]: option }))
                    }
                    className={`flex h-11 items-center rounded-xl border px-4 text-sm font-medium ${
                      selected
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-300 bg-white text-zinc-950"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pb-6 pt-6">
        <SubmitButton disabled={!allAnswered} onClick={handleContinue}>
          Continue
        </SubmitButton>
      </div>
    </div>
  );
}
