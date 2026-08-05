import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError("Couldn't sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <span className="qp-label">Teacher</span>
        <h1 className="qp-display qp-h1">Sign in</h1>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="qp-label">Email</label>
            <input className="qp-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="qp-label">Password</label>
            <input className="qp-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="qp-error">{error}</p>}
          <button className="qp-btn qp-btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="qp-sub" style={{ marginTop: 18, marginBottom: 0 }}>
          No account? <Link className="qp-link" to="/signup">Create one</Link>
        </p>
        <p className="qp-sub" style={{ marginTop: 6 }}>
          <Link className="qp-link" to="/join">Joining a test as a student instead?</Link>
        </p>
      </div>
    </div>
  );
}
