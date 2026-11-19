import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { OtpInput } from "../components/OtpInput";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError, authApi } from "../lib/api";

interface LocationState {
  email?: string;
}

export function VerifyResetCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const email = (location.state as LocationState | null)?.email ?? queryEmail;

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.verifyResetCode({ email, code });
      navigate("/reset-password", { state: { email, code, codeVerified: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not verify the code");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery · Step 02"
      topLink={
        <Link to="/forgot-password" className="link link-back">
          ← Back
        </Link>
      }
      footer={
        <>
          <span>Secure study session</span>
          <span>Encrypted 256-bit</span>
        </>
      }
    >
      <header className="form-header">
        <h1 className="form-title">Enter your code</h1>
        <p className="form-lede">
          Enter the 6-digit reset code we emailed <strong className="mono-inline">{email}</strong>.
        </p>
      </header>

      {error && error !== "Enter the full 6-digit code" ? (
        <Alert tone="error" title="Code not accepted" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className={`field${error ? " field-invalid" : ""}`}>
          <span className="field-label">6-digit code</span>
          <OtpInput value={code} onChange={setCode} disabled={submitting} />
          {error ? <p className="field-error">{error}</p> : null}
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <SpinnerIcon className="spin" />
              Verifying…
            </>
          ) : (
            <>
              Continue
              <ArrowIcon />
            </>
          )}
        </button>
      </form>

      <p className="form-note">The code expires in 10 minutes after it’s sent.</p>
    </AuthShell>
  );
}
