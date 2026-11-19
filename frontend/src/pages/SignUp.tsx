import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { Field } from "../components/Field";
import { PasswordField } from "../components/PasswordField";
import { StrengthMeter } from "../components/StrengthMeter";
import { ArrowIcon, SpinnerIcon } from "../components/Icon";
import { ApiError, authApi } from "../lib/api";
import { fieldErrorsFromZod, registerSchema, type FieldErrors } from "../lib/schemas";

type SignupField = "fullName" | "email" | "password" | "confirmPassword";

export function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<SignupField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearField = (field: SignupField) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error) as FieldErrors<SignupField>);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      await authApi.register({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      navigate("/verify-email", { state: { email: parsed.data.email } });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Could not create your account");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Step 01 of 02 · Create account"
      topLink={
        <span className="topbar-link">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Log in
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
        <h1 className="form-title">Create your account</h1>
        <p className="form-lede">
          Join students who study smarter — a quiet desk, your notes, and spaced recall in one place.
        </p>
      </header>

      {formError ? (
        <Alert tone="error" title="Could not create account" onDismiss={() => setFormError(null)}>
          {formError}
        </Alert>
      ) : null}

      <form className="form" onSubmit={onSubmit} noValidate>
        <Field
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Eleanor Nightingale"
          value={fullName}
          maxLength={200}
          error={errors.fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            clearField("fullName");
          }}
        />
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
            clearField("email");
          }}
        />
        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            error={errors.password}
            hint={errors.password ? undefined : "8+ chars with upper, lower, number & symbol"}
            disabled={submitting}
            onChange={(e) => {
              setPassword(e.target.value);
              clearField("password");
            }}
          />
          <StrengthMeter password={password} />
        </div>
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          error={errors.confirmPassword}
          disabled={submitting}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearField("confirmPassword");
          }}
        />

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <SpinnerIcon className="spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowIcon />
            </>
          )}
        </button>
      </form>

      <p className="form-note">
        We’ll email you a 6-digit code to verify your address before you can log in.
      </p>
    </AuthShell>
  );
}
