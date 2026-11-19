import type { ReactNode } from "react";
import { CheckIcon, ErrorIcon, InfoIcon } from "./Icon";

type Tone = "error" | "success" | "info";

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
}

const icons: Record<Tone, typeof ErrorIcon> = {
  error: ErrorIcon,
  success: CheckIcon,
  info: InfoIcon,
};

export function Alert({ tone = "error", title, children, onDismiss }: AlertProps) {
  const Icon = icons[tone];

  return (
    <div className={`alert alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="alert-icon">
        <Icon />
      </span>
      <div className="alert-body">
        {title ? <strong className="alert-title">{title}</strong> : null}
        {children ? <div className="alert-text">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
