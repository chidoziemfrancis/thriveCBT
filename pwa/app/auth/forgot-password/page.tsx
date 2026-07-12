import Link from "next/link";
import AuthHeader from "../_components/AuthHeader";
import AuthField from "../_components/AuthField";
import SubmitButton from "../../components/SubmitButton";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <AuthHeader />

      <div className="flex flex-1 flex-col px-5 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Reset password.
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          Enter your email and we&rsquo;ll send you a link to reset your
          password.
        </p>

        <form className="mt-6 flex flex-col gap-4">
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
          className="mt-6 text-center text-xs text-zinc-950 underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
