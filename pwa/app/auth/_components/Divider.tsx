export default function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-200" />
      <span className="text-sm text-zinc-400">or</span>
      <div className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}
