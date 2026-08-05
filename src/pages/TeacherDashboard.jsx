import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Plus, ArrowRight, LogOut } from "lucide-react";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "quizzes"), where("ownerId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="qp-label">Welcome back{user?.displayName ? `, ${user.displayName}` : ""}</span>
            <h1 className="qp-display qp-h1">Your quizzes</h1>
          </div>
          <button className="qp-link" onClick={() => { logout(); nav("/login"); }}><LogOut size={13} /> Sign out</button>
        </div>

        <button className="qp-btn qp-btn-primary" onClick={() => nav("/create")} style={{ marginBottom: 24 }}>
          <Plus size={16} /> New quiz
        </button>

        {quizzes === null && <p className="qp-sub">Loading…</p>}
        {quizzes?.length === 0 && <p className="qp-sub">Nothing published yet — create your first quiz above.</p>}
        {quizzes?.map((q) => (
          <div key={q.id} className="qp-option" onClick={() => nav(`/results/${q.id}`)} style={{ cursor: "pointer" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div className="qp-sub" style={{ margin: 0 }}>Code: <span className="qp-code qp-mono">{q.code}</span> · {q.questions?.length || 0} questions</div>
            </div>
            <ArrowRight size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
