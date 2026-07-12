export default function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-medium text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
