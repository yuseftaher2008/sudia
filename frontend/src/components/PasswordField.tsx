import { useId, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./Icon";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label: string;
  error?: string;
  hint?: string;
}

export function PasswordField({ label, error, hint, className = "", ...inputProps }: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={`field${error ? " field-invalid" : ""} ${className}`.trim()}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          className="input input-with-toggle"
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          className="input-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
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
