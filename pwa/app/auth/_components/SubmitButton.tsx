export default function SubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-zinc-950 text-base font-medium text-white"
    >
      {children}
    </button>
  );
}
