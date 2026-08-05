import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { hashStr, mulberry32, shuffle, fmtTime } from "../utils/shuffle";
import { useLockdown } from "../utils/useLockdown";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldAlert } from "lucide-react";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { quiz, studentName } = location.state || {};

  // If someone lands here directly (refresh, bookmarked URL) there's no
  // quiz/name in memory — send them back to join properly.
  useEffect(() => {
    if (!quiz) nav("/join", { replace: true });
  }, [quiz, nav]);

  if (!quiz) return null;
  return <QuizRunner quiz={quiz} quizId={quizId} studentName={studentName} onFinish={(r) => nav("/quiz-result", { state: { result: r }, replace: true })} />;
}

function QuizRunner({ quiz, quizId, studentName, onFinish }) {
  const seed = useRef(hashStr(quizId + studentName + Date.now())).current;
  const rng = useRef(mulberry32(seed)).current;
  const shuffled = useRef(
    shuffle(quiz.questions, rng).map((q) => ({ ...q, options: shuffle(q.options, rng) }))
  ).current;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(quiz.durationMinutes * 60);
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState(null);
  const startedAt = useRef(Date.now());
  const submittedRef = useRef(false);

  const doSubmit = useCallback(async (autoSubmitted) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    let score = 0;
    shuffled.forEach((q) => {
      const sel = answers[q.id];
      if (sel !== undefined && q.options[sel]?.isCorrect) score++;
    });
    const result = {
      quizId,
      quizTitle: quiz.title,
      studentName,
      score,
      total: shuffled.length,
      timeTakenSec: Math.round((Date.now() - startedAt.current) / 1000),
      violations,
      autoSubmitted: !!autoSubmitted,
      submittedAt: serverTimestamp(),
    };
    await addDoc(collection(db, "results"), result);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    onFinish({ ...result, submittedAt: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, shuffled, quizId, quiz.title, studentName, violations, onFinish]);

  const handleViolation = useCallback((kind) => {
    if (submittedRef.current) return;
    setViolations((v) => {
      const next = v + 1;
      if (next >= quiz.violationLimit) {
        doSubmit(true);
      } else {
        setWarning(kind);
      }
      return next;
    });
  }, [quiz.violationLimit, doSubmit]);

  const { enterFullscreen } = useLockdown({ active: true, onViolation: handleViolation });

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); doSubmit(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [doSubmit]);

  const q = shuffled[idx];
  const low = secondsLeft <= 60;

  const warningCopy = {
    "tab-switch": "You switched tabs or minimized the window.",
    "fullscreen-exit": "You left full-screen mode.",
    "shortcut": "A blocked keyboard shortcut was used.",
  };

  return (
    <div className="qp-card">
      {warning && (
        <div className="qp-modal-backdrop">
          <div className="qp-modal">
            <ShieldAlert size={22} color="#A63D2F" />
            <h2 className="qp-display" style={{ fontSize: 20, margin: "10px 0 8px" }}>Flag {violations} of {quiz.violationLimit}</h2>
            <p style={{ fontSize: 14, color: "#3d4759", lineHeight: 1.5 }}>
              {warningCopy[warning] || "A test rule was broken."} Reaching {quiz.violationLimit} flags auto-submits your test immediately.
            </p>
            <button className="qp-btn qp-btn-primary" style={{ marginTop: 6 }} onClick={() => { setWarning(null); enterFullscreen(); }}>
              Back to test
            </button>
          </div>
        </div>
      )}
      <div className="qp-card-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="qp-label" style={{ marginBottom: 0 }}>{studentName} · {quiz.title}</span>
          <div className={`qp-timer ${low ? "low" : ""}`}><Clock size={14} /> {fmtTime(secondsLeft)}</div>
        </div>
        <p className="qp-sub">Question {idx + 1} of {shuffled.length} {violations > 0 && <span style={{ color: "#A63D2F" }}>· {violations} flag{violations > 1 ? "s" : ""}</span>}</p>

        <h2 className="qp-display" style={{ fontSize: 20, fontWeight: 600, margin: "18px 0 20px", lineHeight: 1.4 }}>{q.question}</h2>

        {q.options.map((opt, oi) => (
          <div key={oi} className={`qp-option ${answers[q.id] === oi ? "selected" : ""}`} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}>
            <span className="qp-badge">{String.fromCharCode(65 + oi)}</span>
            <span>{opt.text}</span>
          </div>
        ))}

        <div className="qp-row" style={{ marginTop: 20, justifyContent: "space-between" }}>
          <button className="qp-btn qp-btn-ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}><ArrowLeft size={15} /> Previous</button>
          {idx < shuffled.length - 1 ? (
            <button className="qp-btn qp-btn-primary" onClick={() => setIdx((i) => i + 1)}>Next <ArrowRight size={15} /></button>
          ) : (
            <button className="qp-btn qp-btn-primary" onClick={() => doSubmit(false)}>Submit test <Check size={15} /></button>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 18, flexWrap: "wrap" }}>
          {shuffled.map((sq, i) => (
            <div key={sq.id} onClick={() => setIdx(i)} className="qp-mono" style={{
              width: 26, height: 26, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, cursor: "pointer", border: i === idx ? "1.5px solid #1B2A4A" : "1px solid #DCD6C7",
              background: answers[sq.id] !== undefined ? "#F0EDE3" : "#fff",
            }}>{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
