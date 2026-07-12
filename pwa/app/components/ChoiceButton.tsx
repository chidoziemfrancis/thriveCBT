export default function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 w-full items-center rounded-2xl border px-5 text-sm font-medium transition-colors ${
        selected
          ? "border-zinc-950 bg-zinc-950 text-white"
          : "border-zinc-300 bg-white text-zinc-950"
      }`}
    >
      {children}
    </button>
  );
}
