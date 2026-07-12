function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function JournalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4h9l3 3v13H6V4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  { label: "Home", Icon: HomeIcon },
  { label: "Sessions", Icon: SessionsIcon },
  { label: "Journal", Icon: JournalIcon },
  { label: "Progress", Icon: ProgressIcon },
];

export default function BottomNav({ active = "Home" }: { active?: string }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 left-1/2 w-full max-w-[600px] -translate-x-1/2 border-t border-zinc-200 bg-white px-2 pt-2"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-between">
        {TABS.map(({ label, Icon }) => {
          const isActive = label === active;
          return (
            <button
              key={label}
              type="button"
              className={`flex flex-1 flex-col items-center gap-1 py-1.5 ${
                isActive ? "text-zinc-950" : "text-zinc-400"
              }`}
            >
              <Icon />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
