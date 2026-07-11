"use client";

import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";

export default function AuthHeader() {
  const router = useRouter();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-black px-4">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-9 w-9 items-center justify-center text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 4l-8 8 8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Logo className="h-6 w-6 text-white" />

      <button
        type="button"
        aria-label="Help"
        className="flex h-9 w-9 items-center justify-center text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9.5 9.5a2.5 2.5 0 114.2 1.8c-.6.6-1.2.9-1.2 2.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" />
        </svg>
      </button>
    </header>
  );
}
