type PillInputProps = {
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
};

export default function PillInput({
  name,
  type = "text",
  autoComplete,
  placeholder,
}: PillInputProps) {
  return (
    <input
      type={type}
      name={name}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="h-14 w-full rounded-2xl border border-zinc-300 bg-white px-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
    />
  );
}
