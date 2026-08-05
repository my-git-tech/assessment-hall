import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signup(name, email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "That email is already registered." : "Couldn't create your account. Password needs 6+ characters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <span className="qp-label">Teacher</span>
        <h1 className="qp-display qp-h1">Create your account</h1>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="qp-label">Your name</label>
            <input className="qp-input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="qp-label">Email</label>
            <input className="qp-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="qp-label">Password</label>
            <input className="qp-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="qp-error">{error}</p>}
          <button className="qp-btn qp-btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="qp-sub" style={{ marginTop: 18, marginBottom: 0 }}>
          Already have an account? <Link className="qp-link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
