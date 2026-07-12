type TimelineItemProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  isLast?: boolean;
};

export default function TimelineItem({
  icon,
  iconBg,
  title,
  isLast,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
        >
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-zinc-200" />}
      </div>
      <p
        className={`pt-2.5 text-base font-medium text-zinc-950 ${isLast ? "" : "pb-8"}`}
      >
        {title}
      </p>
    </div>
  );
}
