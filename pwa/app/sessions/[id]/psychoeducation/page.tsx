"use client";

import { useParams, useRouter } from "next/navigation";
import BackButton from "../../../components/BackButton";
import SubmitButton from "../../../components/SubmitButton";
import { completeModule } from "../../_lib/sessionProgress";

const CAUSES = [
  "Academic stress",
  "Relationship problems",
  "Loneliness",
  "Financial difficulties",
  "Family pressure",
];

export default function PsychoeducationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  function handleContinue() {
    completeModule(id, "psychoeducation");
    router.push(`/sessions/${id}/mood-check`);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        Understanding depression
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-3xl bg-white p-5">
          <p className="text-sm font-semibold text-zinc-950">
            What is depression?
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Depression is a common mental health condition that affects how
            you feel, think, and handle daily activities. It goes beyond
            ordinary sadness — it can affect your sleep, appetite, energy,
            concentration, and sense of self-worth for weeks at a time.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5">
          <p className="text-sm font-semibold text-zinc-950">
            Common symptoms
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-zinc-600">
            <li>Persistent sadness or low mood</li>
            <li>Loss of interest in activities you used to enjoy</li>
            <li>Changes in sleep or appetite</li>
            <li>Low energy or fatigue</li>
            <li>Trouble concentrating</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-5">
          <p className="text-sm font-semibold text-zinc-950">
            Common causes among undergraduates
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAUSES.map((cause) => (
              <span
                key={cause}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700"
              >
                {cause}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl bg-white p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 6l10 6-10 6V6z" fill="white" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-950">
              What Happens in Depression?
            </p>
            <p className="text-xs text-zinc-500">Video &middot; coming soon</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pb-6 pt-6">
        <SubmitButton onClick={handleContinue}>Continue</SubmitButton>
      </div>
    </div>
  );
}
