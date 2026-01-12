import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { theme } from "../ui/theme";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1200px 800px at 20% 20%, rgba(212,175,55,0.08), transparent 55%), linear-gradient(180deg, #0a0a0d, #0d0d11)",
    color: theme.text,
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: theme.radius,
    border: `1px solid ${theme.border}`,
    background: "rgba(18,18,20,0.78)",
    boxShadow: theme.shadowSoft,
    padding: 22,
    display: "grid",
    gap: 16,
  },
  header: { display: "grid", gap: 8 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid rgba(212,175,55,0.4)`,
    background: "rgba(212,175,55,0.12)",
    color: theme.gold,
    fontSize: theme.type.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontWeight: 800,
    width: "fit-content",
  },
  title: { fontSize: 26, fontWeight: 800 },
  subtitle: { color: theme.muted2, lineHeight: 1.5 },
  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.text,
    cursor: "pointer",
    fontSize: theme.type.sm,
  },
  form: { display: "grid", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: theme.type.sm },
  input: {
    padding: "10px 12px",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.text,
    fontSize: theme.type.sm,
  },
  button: enabled => ({
    padding: "12px 14px",
    borderRadius: theme.radius,
    border: `1px solid ${enabled ? "rgba(212,175,55,0.8)" : theme.border2}`,
    background: enabled
      ? "linear-gradient(180deg, rgba(212,175,55,0.95), rgba(212,175,55,0.72))"
      : "#0f0f10",
    color: enabled ? "#0b0b0c" : theme.muted,
    fontWeight: 800,
    cursor: enabled ? "pointer" : "not-allowed",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  }),
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: theme.muted2,
    fontSize: theme.type.sm,
  },
  error: { color: theme.red, fontSize: theme.type.sm },
  note: { color: theme.muted2, fontSize: theme.type.xs },
};

const DEFAULT_REDIRECT = "/project/current";

export default function Login() {
  const { user, loading, signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(
    () => location.state?.from?.pathname || DEFAULT_REDIRECT,
    [location.state?.from?.pathname]
  );

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, navigate, redirectTo, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setPending(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
      } else {
        await signUp(email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>ForgedMusic</span>
          <div style={styles.title}>Quick Forge Login</div>
          <div style={styles.subtitle}>
            Sign in to access your sessions, renders, and studio rooms. When you need more control, jump straight into
            the Control Room.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={styles.note}>Use the same account for dashboard and studio.</span>
          <button
            type="button"
            style={styles.toggle}
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              autoComplete="email"
              style={styles.input}
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@studio.com"
              required
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              style={styles.input}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button(!pending)} disabled={pending}>
            {pending ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>
            Need help?{" "}
            <a href="https://supabase.com" style={{ color: theme.gold }}>
              Check email access
            </a>
          </span>
          <span style={styles.note}>Secure sessions by Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
