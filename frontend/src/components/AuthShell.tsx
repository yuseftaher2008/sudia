import type { ReactNode } from "react";

interface AuthShellProps {
  /** Mono eyebrow above the heading, e.g. "Step 01 of 02 · Create account" */
  eyebrow?: string;
  /** Top-right link slot, e.g. "New to Studia? Create an account" */
  topLink?: ReactNode;
  children: ReactNode;
  /** Bottom meta row on the form side */
  footer?: ReactNode;
}

export function AuthShell({ eyebrow, topLink, children, footer }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="brand-panel" aria-hidden="true">
        <div className="brand-grid" />
        <div className="brand-top">
          <div className="brand-mark">
            <span className="brand-badge">S</span>
            <span className="brand-word">Studia&nbsp;·</span>
          </div>
          <span className="brand-vol">Vol. 2025 · Ed. IV</span>
        </div>

        <div className="brand-center">
          <span className="brand-eyebrow">Scholarly portal</span>
          <h2 className="brand-display">
            Quiet
            <br />
            discipline.
          </h2>
          <p className="brand-quote">
            “Where rigorous thought meets quiet discipline. Built for scholars who take their craft
            seriously.”
          </p>
        </div>

        <div className="brand-bottom">
          <div className="brand-tags">
            <span className="brand-tag">Spaced recall</span>
            <span className="brand-tag">Deep work</span>
            <span className="brand-tag">Annotations</span>
          </div>
          <div className="brand-meta">
            <span>Oxford · Cambridge · Sorbonne</span>
            <span>ISSN 2941-00X</span>
          </div>
        </div>
      </aside>

      <main className="form-panel">
        <div className="form-topbar">{topLink}</div>

        <div className="form-main">
          {eyebrow ? <p className="form-eyebrow">{eyebrow}</p> : null}
          {children}
        </div>

        <div className="form-footer">{footer}</div>
      </main>
    </div>
  );
}
