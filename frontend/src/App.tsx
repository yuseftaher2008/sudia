import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { SignUp } from "./pages/SignUp";
import { LogIn } from "./pages/LogIn";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { VerifyResetCode } from "./pages/VerifyResetCode";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";

function BootScreen() {
  return (
    <div className="boot" role="status" aria-live="polite">
      <span className="brand-badge boot-badge">S</span>
      <span className="boot-label">Studia · opening your study desk…</span>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <BootScreen />;
  if (status === "anonymous") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <BootScreen />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthenticated>
            <SignUp />
          </RedirectIfAuthenticated>
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LogIn />
          </RedirectIfAuthenticated>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-code" element={<VerifyResetCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
