export function FormField({ label, hint, htmlFor, required = false, children }) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
        {required ? <span className="text-xs font-semibold text-[var(--brand)]">Required</span> : null}
      </div>
      {children}
      {hint ? <p className="text-sm text-[var(--muted)]">{hint}</p> : null}
    </label>
  );
}

export function SelectField({ label, hint, htmlFor, required, options, placeholder, ...props }) {
  return (
    <FormField label={label} hint={hint} htmlFor={htmlFor} required={required}>
      <select id={htmlFor} className="field" {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const normalizedOption =
            typeof option === "string" ? { label: option.replaceAll("_", " "), value: option } : option;

          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    </FormField>
  );
}

export function InputField({ label, hint, htmlFor, required, ...props }) {
  return (
    <FormField label={label} hint={hint} htmlFor={htmlFor} required={required}>
      <input id={htmlFor} className="field" {...props} />
    </FormField>
  );
}

export function TextAreaField({ label, hint, htmlFor, required, ...props }) {
  return (
    <FormField label={label} hint={hint} htmlFor={htmlFor} required={required}>
      <textarea id={htmlFor} className="field min-h-32 resize-y" {...props} />
    </FormField>
  );
}
