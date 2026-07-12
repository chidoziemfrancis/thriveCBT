type PillInputProps = {
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function PillInput({
  name,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}: PillInputProps) {
  return (
    <input
      type={type}
      name={name}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-14 w-full rounded-2xl border border-zinc-300 bg-white px-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
    />
  );
}
