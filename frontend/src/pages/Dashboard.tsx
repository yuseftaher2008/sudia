import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckIcon, SpinnerIcon } from "../components/Icon";
import { useAuth } from "../auth/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const firstName = user.fullName.trim().split(/\s+/)[0] ?? user.fullName;
  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="desk">
      <header className="desk-header">
        <div className="brand-mark">
          <span className="brand-badge brand-badge-light">S</span>
          <span className="desk-word">Studia&nbsp;·</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onLogout} disabled={loggingOut}>
          {loggingOut ? (
            <>
              <SpinnerIcon className="spin" />
              Signing out…
            </>
          ) : (
            "Log out"
          )}
        </button>
      </header>

      <main className="desk-main">
        <p className="form-eyebrow">Study desk</p>
        <h1 className="desk-title">Welcome back, {firstName}.</h1>
        <p className="form-lede">
          You’re signed in. This session is held by a short-lived access token — reload the page and
          you’ll stay signed in via the refresh cookie.
        </p>

        <section className="desk-card" aria-label="Account details">
          <div className="desk-row">
            <span className="desk-key">Name</span>
            <span className="desk-value">{user.fullName}</span>
          </div>
          <div className="desk-row">
            <span className="desk-key">Email</span>
            <span className="desk-value">{user.email}</span>
          </div>
          <div className="desk-row">
            <span className="desk-key">Status</span>
            <span className="desk-value desk-verified">
              <CheckIcon />
              Email verified
            </span>
          </div>
          <div className="desk-row">
            <span className="desk-key">Member since</span>
            <span className="desk-value">{memberSince}</span>
          </div>
          <div className="desk-row">
            <span className="desk-key">User ID</span>
            <span className="desk-value desk-id">{user.id}</span>
          </div>
        </section>

        <p className="form-note">
          Reading <code className="mono-inline">GET /api/auth/me</code> with your bearer token —
          wired to the Studia backend.
        </p>

        <p className="desk-links">
          <Link to="/signup" className="link">
            Register another account
          </Link>
        </p>
      </main>
    </div>
  );
}
