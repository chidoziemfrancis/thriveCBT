"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../components/BackButton";
import Avatar from "../components/Avatar";
import ProfileRow from "./_components/ProfileRow";
import { getOnboardingData } from "../onboarding/_lib/onboardingStore";
import { getUserSession } from "../auth/_lib/userSession";
import { SESSIONS } from "../sessions/_lib/sessions";
import { CURRENT_SESSION } from "../sessions/_lib/currentSession";

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) age -= 1;

  return age;
}

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [isUndergraduate, setIsUndergraduate] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const onboarding = getOnboardingData();
    setName(onboarding.name ?? "");
    setIsUndergraduate(onboarding.isUndergraduate);
    setAge(onboarding.dateOfBirth ? calculateAge(onboarding.dateOfBirth) : null);
    setEmail(getUserSession().email ?? "");
  }, []);

  function handleLogout() {
    localStorage.clear();
    router.push("/auth/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 pt-6 pb-10">
      <BackButton />

      <div className="mt-6 flex flex-col items-center">
        <Avatar name={name || "?"} size={64} />
        <p className="mt-3 text-lg font-semibold text-zinc-950">
          {name || "There"}
        </p>
        {email && <p className="text-sm text-zinc-500">{email}</p>}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 rounded-3xl bg-white p-4">
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-zinc-950">
            {CURRENT_SESSION}/{SESSIONS.length}
          </p>
          <p className="text-xs text-zinc-500">Sessions</p>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-zinc-100">
          <p className="text-lg font-semibold text-zinc-950">
            {age ?? "—"}
          </p>
          <p className="text-xs text-zinc-500">Age</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-zinc-950">
            {isUndergraduate === undefined ? "—" : isUndergraduate ? "Yes" : "No"}
          </p>
          <p className="text-xs text-zinc-500">Undergrad</p>
        </div>
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Support
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <ProfileRow
          label="Emergency support"
          sublabel="Crisis resources, always available"
          iconBg="bg-red-50 text-red-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
        />
        <ProfileRow
          label="Contact your researcher"
          sublabel="In-app message, WhatsApp, or phone"
          iconBg="bg-indigo-50 text-indigo-500"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2V6z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-zinc-400">
        Legal
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <ProfileRow
          label="Terms of Use"
          iconBg="bg-zinc-100 text-zinc-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 4h9l3 3v13H6V4z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
        />
        <ProfileRow
          label="Privacy Policy"
          iconBg="bg-zinc-100 text-zinc-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className="mt-8">
        <ProfileRow
          label="Log out"
          danger
          iconBg="bg-red-50 text-red-500"
          onClick={handleLogout}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3M16 16l4-4-4-4M20 12H9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
