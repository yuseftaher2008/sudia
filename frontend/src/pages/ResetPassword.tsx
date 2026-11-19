import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { PasswordField } from "../components/PasswordField";
import { StrengthMeter } from "../components/StrengthMeter";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError, authApi } from "../lib/api";
import { fieldErrorsFromZod, resetPasswordSchema, type FieldErrors } from "../lib/schemas";

interface LocationState {
  email?: string;
  code?: string;
  codeVerified?: boolean;
}

type ResetField = "newPassword" | "confirmPassword";

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const queryEmail = new URLSearchParams(location.search).get("email") ?? "";
  const email = state?.email ?? queryEmail;
  const code = state?.code ?? "";
  const codeVerified = Boolean(state?.codeVerified && state?.code && state?.email);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors<ResetField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!codeVerified) return <Navigate to="/forgot-password" replace />;

  const clearField = (field: ResetField) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = resetPasswordSchema.safeParse({ newPassword, confirmPassword: confirm });
    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error) as FieldErrors<ResetField>);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      await authApi.resetPassword({ email, code, newPassword: parsed.data.newPassword });
      navigate("/login", { state: { passwordReset: true }, replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reset your password");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery · Step 03"
      topLink={
        <Link to="/login" className="link link-back">
          ← Back to log in
        </Link>
      }
      footer={
        <>
          <span>All sessions signed out</span>
          <span>Encrypted 256-bit</span>
        </>
      }
    >
      <header className="form-header">
        <h1 className="form-title">Choose a new password</h1>
        <p className="form-lede">
          Code confirmed for <strong className="mono-inline">{email}</strong>. Pick a new password
          for your account.
        </p>
      </header>

      {formError ? (
        <Alert tone="error" title="Reset failed" onDismiss={() => setFormError(null)}>
          {formError}
        </Alert>
      ) : null}

      <form className="form" onSubmit={onSubmit} noValidate>
        <div>
          <PasswordField
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="Create a new password"
            value={newPassword}
            error={errors.newPassword}
            hint={errors.newPassword ? undefined : "8+ chars with upper, lower, number & symbol"}
            disabled={submitting}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearField("newPassword");
            }}
          />
          <StrengthMeter password={newPassword} />
        </div>

        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat the new password"
          value={confirm}
          error={errors.confirmPassword}
          disabled={submitting}
          onChange={(e) => {
            setConfirm(e.target.value);
            clearField("confirmPassword");
          }}
        />

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <SpinnerIcon className="spin" />
              Resetting…
            </>
          ) : (
            <>
              Reset password
              <ArrowIcon />
            </>
          )}
        </button>
      </form>

      <p className="form-note">Resetting your password signs out every other session.</p>
    </AuthShell>
  );
}
