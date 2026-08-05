import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { requestFullscreen } from "../utils/useLockdown";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function StudentJoin() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setError(""); setLoading(true);
    const cleanCode = code.trim().toUpperCase();
    const snap = await getDoc(doc(db, "quizzes", cleanCode));
    setLoading(false);
    if (!snap.exists()) { setError("No test found with that code."); return; }
    requestFullscreen(); // must fire inside this click handler to succeed
    nav(`/quiz/${cleanCode}`, { state: { quiz: snap.data(), studentName: name.trim() || "Anonymous" } });
  };

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <button className="qp-link" onClick={() => nav("/login")} style={{ marginBottom: 16, textDecoration: "none" }}><ArrowLeft size={14} /> Teacher sign in</button>
        <span className="qp-label">Student</span>
        <h1 className="qp-display qp-h1">Join a test</h1>
        <p className="qp-sub">Enter your name and the code your teacher shared. The test opens in full screen.</p>
        <div style={{ marginBottom: 14 }}>
          <label className="qp-label">Your name</label>
          <input className="qp-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="qp-label">Test code</label>
          <input className="qp-input qp-mono" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" maxLength={6} />
        </div>
        {error && <p className="qp-error">{error}</p>}
        <div style={{ background: "#F0EDE3", border: "1px solid #DCD6C7", borderRadius: 3, padding: 12, fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>
          <ShieldAlert size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          Leaving full screen, switching tabs, or using copy/inspect shortcuts is tracked. Repeated flags auto-submit your test.
        </div>
        <button className="qp-btn qp-btn-primary" disabled={!name.trim() || !code.trim() || loading} onClick={handleStart} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Checking…" : "Start test"}
        </button>
      </div>
    </div>
  );
}
