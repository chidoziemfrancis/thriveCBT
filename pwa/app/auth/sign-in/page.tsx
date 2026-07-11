import Link from "next/link";
import AuthHeader from "../_components/AuthHeader";
import AuthField from "../_components/AuthField";
import PasswordField from "../_components/PasswordField";
import SubmitButton from "../_components/SubmitButton";
import Divider from "../_components/Divider";
import LegalFooter from "../_components/LegalFooter";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <AuthHeader />

      <div className="flex flex-1 flex-col px-6 pt-10">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Welcome back.
        </h1>

        <form className="mt-10 flex flex-col gap-6">
          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <PasswordField autoComplete="current-password" />

          <Link
            href="/auth/forgot-password"
            className="text-sm text-zinc-950 underline-offset-2 hover:underline"
          >
            Forgot Password?
          </Link>

          <SubmitButton>Sign in</SubmitButton>
        </form>

        <Divider />

        <Link
          href="/auth/sign-up"
          className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-950"
        >
          Don&rsquo;t have an account?{" "}
          <span className="ml-1 font-semibold">Sign up</span>
        </Link>

        <LegalFooter />
      </div>
    </div>
  );
}
