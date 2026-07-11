import Link from "next/link";

export default function LegalFooter() {
  return (
    <p className="mt-6 text-center text-xs text-zinc-500">
      By continuing, you agree to our{" "}
      <Link href="/terms" className="font-semibold underline">
        Terms of Use
      </Link>{" "}
      and acknowledge that you have read our{" "}
      <Link href="/privacy" className="font-semibold underline">
        Privacy Policy.
      </Link>
    </p>
  );
}
