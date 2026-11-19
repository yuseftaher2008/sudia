import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { Field } from "../components/Field";
import { PasswordField } from "../components/PasswordField";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

interface LocationState {
  verifiedEmail?: string;
  passwordReset?: boolean;
  from?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LogIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = (location.state ?? {}) as LocationState;

  const [email, setEmail] = useState(state.verifiedEmail ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setUnverified(false);

    const fieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) fieldErrors.email = "Enter your email address";
    else if (!EMAIL_RE.test(email.trim())) fieldErrors.email = "Enter a valid email address";
    if (!password) fieldErrors.password = "Enter your password";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(state.from ?? "/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.message === "Email not verified") {
        setUnverified(true);
      } else {
        setFormError(error instanceof ApiError ? error.message : "Could not log you in");
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Member access"
      topLink={
        <span className="topbar-link">
          New to Studia?{" "}
          <Link to="/signup" className="link">
            Create an account
          </Link>
        </span>
      }
      footer={
        <>
          <span>Secure study session</span>
          <span>Encrypted 256-bit</span>
        </>
      }
    >
      <header className="form-header">
        <h1 className="form-title">Welcome back</h1>
        <p className="form-lede">Continue your daily focus sessions and spaced recall decks.</p>
      </header>

      {state.verifiedEmail ? (
        <Alert tone="success" title="Email verified">
          Your address is confirmed — log in to open your study desk.
        </Alert>
      ) : null}

      {state.passwordReset ? (
        <Alert tone="success" title="Password updated">
          Log in with your new password. All other sessions were signed out.
        </Alert>
      ) : null}

      {unverified ? (
        <Alert tone="error" title="Email not verified">
          Check your inbox for the 6-digit code, or{" "}
          <Link
            to="/verify-email"
            state={{ email: email.trim().toLowerCase() }}
            className="alert-link"
          >
            request a new one
          </Link>
          .
        </Alert>
      ) : formError ? (
        <Alert tone="error" title="Could not log in" onDismiss={() => setFormError(null)}>
          {formError}
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
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />

        <div className="form-row form-row-end">
          <Link to="/forgot-password" className="link">
            Forgot your password?
          </Link>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <SpinnerIcon className="spin" />
              Signing in…
            </>
          ) : (
            <>
              Log in
              <ArrowIcon />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
