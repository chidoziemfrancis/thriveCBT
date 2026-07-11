export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 4h6a6 6 0 010 12h-6V4z" />
      <path d="M16 16h-6a6 6 0 000 12h6V16z" />
    </svg>
  );
}
