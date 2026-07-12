type LabeledFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function LabeledField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}: LabeledFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-14 w-full rounded-2xl border border-zinc-300 bg-white px-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950"
      />
    </div>
  );
}
