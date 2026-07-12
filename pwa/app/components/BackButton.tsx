"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-950"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 4l-8 8 8 8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
