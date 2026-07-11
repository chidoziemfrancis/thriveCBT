"use client";

import { useState } from "react";
import AuthField from "./AuthField";
import { EyeIcon, EyeOffIcon } from "./EyeIcon";

export default function PasswordField({
  autoComplete = "current-password",
}: {
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      label="Password"
      name="password"
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      }
    />
  );
}
