import Link from "next/link";
import AuthHeader from "../_components/AuthHeader";
import AuthField from "../_components/AuthField";
import SubmitButton from "../_components/SubmitButton";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <AuthHeader />

      <div className="flex flex-1 flex-col px-6 pt-10">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Reset password.
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Enter your email and we&rsquo;ll send you a link to reset your
          password.
        </p>

        <form className="mt-10 flex flex-col gap-6">
          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />

          <SubmitButton>Send reset link</SubmitButton>
        </form>

        <Link
          href="/auth/sign-in"
          className="mt-6 text-center text-sm text-zinc-950 underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
