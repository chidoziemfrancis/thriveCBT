export default function ProgressBar({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const percent = Math.round((step / totalSteps) * 100);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
      <div
        className="h-full rounded-full bg-zinc-950 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
