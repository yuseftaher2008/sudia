import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}

export function OtpInput({ value, onChange, disabled = false, label = "6-digit code" }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const focusAt = (index: number) => {
    const next = refs.current[index];
    if (next) next.focus();
  };

  const commit = (index: number, digit: string) => {
    const chars = [...digits];
    chars[index] = digit;
    const joined = chars.join("").replace(/\s/g, "");
    onChange(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      commit(index, "");
      return;
    }
    commit(index, digit);
    if (index < LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        commit(index, "");
      } else if (index > 0) {
        focusAt(index - 1);
        commit(index - 1, "");
      }
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, LENGTH - 1));
  };

  return (
    <div className="otp-group" role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
