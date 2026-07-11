"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
        Reset password.
      </h1>
      <p className="mt-3 text-sm text-zinc-500">
        Enter your email and we&rsquo;ll send you a link to reset your password.
      </p>

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

        <button
          type="submit"
          className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-zinc-950 text-base font-medium text-white"
        >
          Send reset link
        </button>
      </form>

      <Link
        href="/auth/sign-in"
        className="mt-6 text-center text-sm text-zinc-950 underline-offset-2 hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
