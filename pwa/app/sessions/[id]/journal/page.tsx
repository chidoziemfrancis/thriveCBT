"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "../../../components/BackButton";
import SubmitButton from "../../../components/SubmitButton";
import { completeModule } from "../../_lib/sessionProgress";

export default function JournalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [entry, setEntry] = useState("");

  function handleContinue() {
    completeModule(id, "journal");
    router.push(`/sessions/${id}/complete`);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        Reflection journal
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        What has depression affected most in your life?
      </p>

      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write freely, there&rsquo;s no wrong answer..."
        className="mt-6 h-40 w-full rounded-2xl border border-zinc-300 bg-white p-4 text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
      />

      <div className="mt-auto pb-6 pt-6">
        <SubmitButton
          disabled={entry.trim().length === 0}
          onClick={handleContinue}
        >
          Finish session
        </SubmitButton>
      </div>
    </div>
  );
}
