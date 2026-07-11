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
    <fieldset className="relative rounded-2xl border border-zinc-300 px-4 pb-4">
      <legend className="px-1 text-sm text-zinc-500">{label}</legend>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-transparent text-base text-zinc-950 outline-none placeholder:text-zinc-400"
      />
      {endAdornment}
    </fieldset>
  );
}
