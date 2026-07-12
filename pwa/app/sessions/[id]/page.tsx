"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "../../components/BackButton";
import SubmitButton from "../../components/SubmitButton";
import { SESSIONS } from "../_lib/sessions";
import { SESSION1_MODULES } from "../_lib/session1";
import { getCompletedModules } from "../_lib/sessionProgress";

export default function SessionOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const session = SESSIONS.find((s) => s.id === id);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompletedModules(id));
  }, [id]);

  if (!session) return null;

  const isBuilt = id === 1;
  const nextModule = SESSION1_MODULES.find((m) => !completed.includes(m.id));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Session {session.id} of {SESSIONS.length}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
        {session.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">{session.focus}</p>

      {isBuilt ? (
        <>
          <div className="mt-6 flex flex-col gap-3">
            {SESSION1_MODULES.map((module) => {
              const done = completed.includes(module.id);
              return (
                <div
                  key={module.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-teal-500" : "border border-zinc-300"
                    }`}
                  >
                    {done && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <p
                    className={`text-sm ${done ? "text-zinc-400 line-through" : "text-zinc-950"}`}
                  >
                    {module.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pb-6 pt-6">
            <SubmitButton
              onClick={() =>
                router.push(
                  nextModule
                    ? `/sessions/${id}/${nextModule.path}`
                    : `/sessions/${id}/complete`
                )
              }
            >
              {completed.length === 0
                ? "Begin session"
                : nextModule
                  ? "Continue"
                  : "Review complete"}
            </SubmitButton>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-3xl bg-white p-5">
          <p className="text-sm text-zinc-500">
            This session is coming soon. We&rsquo;re still building it out.
          </p>
        </div>
      )}
    </div>
  );
}
