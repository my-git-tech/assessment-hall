import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { fmtTime } from "../utils/shuffle";
import { ArrowLeft } from "lucide-react";

export default function QuizResults() {
  const { quizId } = useParams();
  const nav = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    getDoc(doc(db, "quizzes", quizId)).then((d) => setQuiz(d.exists() ? d.data() : null));
  }, [quizId]);

  useEffect(() => {
    const q = query(collection(db, "results"), where("quizId", "==", quizId), orderBy("submittedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setResults(snap.docs.map((d) => d.data())));
    return unsub;
  }, [quizId]);

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <button className="qp-link" onClick={() => nav("/dashboard")} style={{ marginBottom: 16, textDecoration: "none" }}><ArrowLeft size={14} /> All quizzes</button>
        <span className="qp-label">Results · live</span>
        <h1 className="qp-display qp-h1">{quiz?.title || "…"}</h1>
        <p className="qp-sub">Code: <span className="qp-code qp-mono">{quizId}</span> · {results.length} submission{results.length === 1 ? "" : "s"}</p>
        {results.length === 0 ? (
          <p className="qp-sub">No submissions yet.</p>
        ) : (
          <table className="qp-table">
            <thead><tr><th>Student</th><th>Score</th><th>Time</th><th>Flags</th></tr></thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.studentName}</td>
                  <td>{r.score}/{r.total}</td>
                  <td className="qp-mono">{fmtTime(r.timeTakenSec)}</td>
                  <td>{r.violations > 0 ? <span style={{ color: "#A63D2F" }}>{r.violations}{r.autoSubmitted ? " (auto)" : ""}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
