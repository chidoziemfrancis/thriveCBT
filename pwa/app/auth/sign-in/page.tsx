"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import PillInput from "../../components/PillInput";
import PasswordField from "../_components/PasswordField";
import SubmitButton from "../../components/SubmitButton";
import Divider from "../_components/Divider";
import SocialButton from "../_components/SocialButton";
import {
  AppleIcon,
  GoogleIcon,
  FacebookIcon,
} from "../_components/SocialIcons";
import LegalFooter from "../_components/LegalFooter";
import { accountExists } from "../_lib/mockAccounts";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [hasAccount, setHasAccount] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (hasAccount) {
      // TODO: submit sign-in request with email + password
      return;
    }

    if (accountExists(email)) {
      setHasAccount(true);
      return;
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-16">
      <Logo className="h-8 w-8 self-center text-zinc-950" />

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-950">
          Get started with your email
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <PillInput
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />

          {hasAccount && <PasswordField autoComplete="current-password" />}

          <SubmitButton>{hasAccount ? "Sign in" : "Continue"}</SubmitButton>
        </form>

        <Divider />

        <div className="flex flex-col gap-3">
          <SocialButton icon={<AppleIcon />}>Continue with Apple</SocialButton>
          <SocialButton icon={<GoogleIcon />}>
            Continue with Google
          </SocialButton>
          <SocialButton icon={<FacebookIcon />}>
            Continue with Facebook
          </SocialButton>
        </div>
      </div>

      <LegalFooter />
    </div>
  );
}
