import { CheckIcon, CrossIcon } from "./Icon";
import { passwordChecks, passwordStrength } from "../lib/schemas";

const CRITERIA: { key: keyof ReturnType<typeof passwordChecks>; label: string }[] = [
  { key: "length", label: "8+ chars" },
  { key: "lower", label: "a–z" },
  { key: "upper", label: "A–Z" },
  { key: "number", label: "0–9" },
  { key: "symbol", label: "Symbol" },
];

export function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const checks = passwordChecks(password);
  const { filled, level, label } = passwordStrength(password);

  return (
    <div className={`strength strength-level-${level}`} role="status" aria-live="polite">
      <div className="strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <span key={seg} className={`strength-seg${filled >= seg ? " strength-seg-on" : ""}`} />
        ))}
      </div>
      <p className="strength-label">
        Password strength: <strong>{label}</strong>
      </p>
      <ul className="strength-checks">
        {CRITERIA.map(({ key, label: text }) => (
          <li key={key} className={checks[key] ? "strength-check met" : "strength-check"}>
            {checks[key] ? <CheckIcon className="strength-check-icon" /> : <CrossIcon className="strength-check-icon" />}
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
