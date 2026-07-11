"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
        Create account.
      </h1>

      <form className="mt-10 flex flex-col gap-6">
        <fieldset className="rounded-2xl border border-zinc-300 px-4 pb-4">
          <legend className="px-1 text-sm text-zinc-500">
            Email
          </legend>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full bg-transparent text-base text-zinc-950 outline-none placeholder:text-zinc-400"
          />
        </fieldset>

        <fieldset className="relative rounded-2xl border border-zinc-300 px-4 pb-4">
          <legend className="px-1 text-sm text-zinc-500">
            Password
          </legend>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            className="w-full bg-transparent text-base text-zinc-950 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        </fieldset>

        <button
          type="submit"
          className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-zinc-950 text-base font-medium text-white"
        >
          Create account
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-sm text-zinc-400">or</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <Link
        href="/sign-in"
        className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-950"
      >
        Already have an account?{" "}
        <span className="ml-1 font-semibold">Sign in</span>
      </Link>

      <p className="mt-6 text-center text-sm text-zinc-500">
        By continuing, you agree to ThriveCBT&rsquo;s{" "}
        <Link href="/terms" className="underline">
          Terms of Use
        </Link>{" "}
        &amp;{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy.
        </Link>
      </p>
    </div>
  );
}
