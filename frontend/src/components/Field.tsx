import { useId, type InputHTMLAttributes } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, className = "", ...inputProps }: FieldProps) {
  const id = useId();

  return (
    <div className={`field${error ? " field-invalid" : ""} ${className}`.trim()}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...inputProps}
      />
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
