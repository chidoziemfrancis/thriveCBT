type AuthFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  endAdornment?: React.ReactNode;
};

export default function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  endAdornment,
}: AuthFieldProps) {
  return (
    <fieldset className="relative rounded-xl border border-zinc-300 px-3 pb-2.5">
      <legend className="px-1 text-xs text-zinc-500">{label}</legend>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
      />
      {endAdornment}
    </fieldset>
  );
}
