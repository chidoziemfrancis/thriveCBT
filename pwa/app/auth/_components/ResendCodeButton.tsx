"use client";

import { useEffect, useState } from "react";

const COOLDOWN_SECONDS = 30;

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 11a8 8 0 10-2.34 5.66M20 11V5m0 6h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResendCodeButton() {
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-xs text-zinc-500">Didn&rsquo;t receive a code?</p>
      <button
        type="button"
        disabled={secondsLeft > 0}
        onClick={() => setSecondsLeft(COOLDOWN_SECONDS)}
        className="flex h-9 w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-4 text-sm font-medium text-zinc-950 disabled:text-zinc-400"
      >
        Resend code
        <RefreshIcon />
      </button>
      {secondsLeft > 0 && (
        <p className="text-xs text-zinc-400">
          You can resend in {secondsLeft} seconds.
        </p>
      )}
    </div>
  );
}
