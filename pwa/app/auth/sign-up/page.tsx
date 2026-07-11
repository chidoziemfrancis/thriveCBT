import Link from "next/link";
import AuthField from "../_components/AuthField";
import PasswordField from "../_components/PasswordField";
import SubmitButton from "../_components/SubmitButton";
import Divider from "../_components/Divider";
import LegalFooter from "../_components/LegalFooter";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
        Create account.
      </h1>

      <form className="mt-10 flex flex-col gap-6">
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <PasswordField autoComplete="new-password" />

        <SubmitButton>Create account</SubmitButton>
      </form>

      <Divider />

      <Link
        href="/auth/sign-in"
        className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-950"
      >
        Already have an account?{" "}
        <span className="ml-1 font-semibold">Sign in</span>
      </Link>

      <LegalFooter />
    </div>
  );
}
