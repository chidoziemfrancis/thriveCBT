export default function Avatar({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white"
    >
      {initial}
    </div>
  );
}
