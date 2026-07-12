export default function ProfileRow({
  icon,
  iconBg,
  label,
  sublabel,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${danger ? "text-red-500" : "text-zinc-950"}`}
        >
          {label}
        </p>
        {sublabel && <p className="text-xs text-zinc-500">{sublabel}</p>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5l7 7-7 7"
          stroke="#a1a1aa"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
