"use client";

import { useParams, useRouter } from "next/navigation";
import SubmitButton from "../../../components/SubmitButton";
import { SESSIONS } from "../../_lib/sessions";

export default function SessionCompletePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const session = SESSIONS.find((s) => s.id === id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 pt-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">
        Session {id} complete
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Great work finishing &ldquo;{session?.title}&rdquo;. See you next
        week.
      </p>

      <div className="mt-auto w-full pb-6">
        <SubmitButton onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </SubmitButton>
      </div>
    </div>
  );
}
