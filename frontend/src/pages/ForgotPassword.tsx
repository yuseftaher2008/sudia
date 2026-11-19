import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { Field } from "../components/Field";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError, authApi } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your email address");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send the reset code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery · Step 01"
      topLink={
        <Link to="/login" className="link link-back">
          ← Back to log in
        </Link>
      }
      footer={
        <>
          <span>Secure study session</span>
          <span>Encrypted 256-bit</span>
        </>
      }
    >
      {sent ? (
        <>
          <header className="form-header">
            <h1 className="form-title">Check your inbox</h1>
            <p className="form-lede">
              If <strong className="mono-inline">{email.trim().toLowerCase()}</strong> belongs to an
              account, a 6-digit reset code is on its way.
            </p>
          </header>

          <Alert tone="success" title="Reset code sent">
            The code expires in 10 minutes. Open the email and continue to enter it.
          </Alert>

          <div className="form">
            <button
              className="btn btn-primary btn-block"
              type="button"
              onClick={() => navigate("/verify-reset-code", { state: { email: email.trim().toLowerCase() } })}
            >
              I have my code
              <ArrowIcon />
            </button>
            <button
              className="btn btn-ghost btn-block"
              type="button"
              onClick={() => setSent(false)}
            >
              Send to a different email
            </button>
          </div>
        </>
      ) : (
        <>
          <header className="form-header">
            <h1 className="form-title">Reset your password</h1>
            <p className="form-lede">
              Enter your email and we’ll send you a 6-digit reset code.
            </p>
          </header>

          {error && error !== "Enter your email address" && error !== "Enter a valid email address" ? (
            <Alert tone="error" title="Could not send code" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <form className="form" onSubmit={onSubmit} noValidate>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@university.edu"
              value={email}
              error={error ?? undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
            />

            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <SpinnerIcon className="spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send reset code
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>

          <p className="form-note">
            For security, the same confirmation appears whether or not the email has an account.
          </p>
        </>
      )}
    </AuthShell>
  );
}
