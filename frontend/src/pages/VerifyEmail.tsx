import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { OtpInput } from "../components/OtpInput";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError, authApi } from "../lib/api";

interface LocationState {
  email?: string;
}

const RESEND_SECONDS = 30;

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const email = (location.state as LocationState | null)?.email ?? queryEmail;

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  if (!email) return <Navigate to="/signup" replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (code.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.verifyEmail({ email, code });
      navigate("/login", { state: { verifiedEmail: email }, replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (countdown > 0 || resending) return;
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setNotice("A new code is on its way — check your inbox.");
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Step 02 of 02 · Verify email"
      topLink={
        <Link to="/signup" className="link link-back">
          ← Use a different email
        </Link>
      }
      footer={
        <>
          <span>© 2026 Studia Research Systems</span>
          <span>Code valid for 15 minutes</span>
        </>
      }
    >
      <header className="form-header">
        <h1 className="form-title">Verify your email</h1>
        <p className="form-lede">
          We sent a 6-digit code to <strong className="mono-inline">{email}</strong>. It expires in 15
          minutes.
        </p>
      </header>

      {error ? (
        <Alert tone="error" title="Verification failed" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {notice ? (
        <Alert tone="success" title="Code resent">
          {notice}
        </Alert>
      ) : null}

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <span className="field-label" id="otp-label">
            6-digit code
          </span>
          <OtpInput value={code} onChange={setCode} disabled={submitting} label="6-digit code" />
          <p className="field-hint" aria-hidden="true">
            Type or paste the code from your inbox
          </p>
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting || code.length !== 6}
        >
          {submitting ? (
            <>
              <SpinnerIcon className="spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify email
              <ArrowIcon />
            </>
          )}
        </button>
      </form>

      <div className="resend-row">
        <span className={`resend-timer${countdown > 0 ? "" : " resend-ready"}`}>
          {countdown > 0 ? `Resend in 0:${String(countdown).padStart(2, "0")}` : "Didn’t get it?"}
        </span>
        <button
          type="button"
          className="link link-button"
          onClick={onResend}
          disabled={countdown > 0 || resending}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </AuthShell>
  );
}
