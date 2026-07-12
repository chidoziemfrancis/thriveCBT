"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "../../components/BackButton";
import SubmitButton from "../../components/SubmitButton";
import ResendCodeButton from "../_components/ResendCodeButton";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/what-to-expect");
  }


  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6">
      <BackButton />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
        Verify your email account
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        A code was sent to your email at {email}. Please enter your code
        below.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="mt-6 flex flex-col gap-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="h-14 w-full rounded-2xl border border-zinc-300 bg-white px-5 text-base tracking-widest text-zinc-950 outline-none placeholder:text-zinc-400"
          />
        </div>

        <ResendCodeButton />

        <div className="mt-auto pb-6">
          <SubmitButton>Next</SubmitButton>
        </div>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
