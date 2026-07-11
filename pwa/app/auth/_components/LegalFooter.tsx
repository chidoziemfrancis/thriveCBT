import Link from "next/link";

export default function LegalFooter() {
  return (
    <p className="mt-6 text-center text-xs text-zinc-500">
      By continuing, you agree to ThriveCBT&rsquo;s{" "}
      <Link href="/terms" className="underline">
        Terms of Use
      </Link>{" "}
      &amp;{" "}
      <Link href="/privacy" className="underline">
        Privacy Policy.
      </Link>
    </p>
  );
}
