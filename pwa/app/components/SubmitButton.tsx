export default function SubmitButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={disabled}
      onClick={onClick}
      className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-medium text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
