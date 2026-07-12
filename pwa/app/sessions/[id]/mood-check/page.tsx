"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "../../../components/BackButton";
import SubmitButton from "../../../components/SubmitButton";
import { completeModule } from "../../_lib/sessionProgress";

const DIMENSIONS = [
  "Sadness",
  "Motivation",
  "Sleep",
  "Energy",
  "Concentration",
];
const SCALE = [1, 2, 3, 4, 5];

export default function MoodCheckPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [ratings, setRatings] = useState<Record<string, number>>({});

  function setRating(dimension: string, value: number) {
    setRatings((prev) => ({ ...prev, [dimension]: value }));
  }

  const allRated = DIMENSIONS.every(
    (dimension) => ratings[dimension] !== undefined
  );

  function handleContinue() {
    completeModule(id, "mood-check");
    router.push(`/sessions/${id}/quiz`);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        Mood self-check
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Rate how you&rsquo;ve been feeling in each area over the past week.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {DIMENSIONS.map((dimension) => (
          <div key={dimension}>
            <p className="text-sm font-medium text-zinc-950">{dimension}</p>
            <div className="mt-2 flex gap-2">
              {SCALE.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(dimension, value)}
                  className={`flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-medium ${
                    ratings[dimension] === value
                      ? "bg-zinc-950 text-white"
                      : "bg-white text-zinc-950"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pb-6 pt-6">
        <SubmitButton disabled={!allRated} onClick={handleContinue}>
          Continue
        </SubmitButton>
      </div>
    </div>
  );
}
