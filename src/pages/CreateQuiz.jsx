import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { genCode } from "../utils/shuffle";
import { parseQuestions } from "../utils/parseQuestions";
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Trash2, AlertTriangle } from "lucide-react";

const PLACEHOLDER = `1. What is the powerhouse of the cell?
A) Nucleus
B) Mitochondria
C) Ribosome
D) Golgi body
Answer: B

2. Which gas do plants absorb from the atmosphere?
A) Oxygen
B) Nitrogen
C) Carbon dioxide
D) Hydrogen
Answer: C`;

export default function CreateQuiz() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [raw, setRaw] = useState("");
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(20);
  const [violationLimit, setViolationLimit] = useState(3);
  const [publishing, setPublishing] = useState(false);
  const [publishedCode, setPublishedCode] = useState(null);

  const handleParse = () => {
    setError("");
    const qs = parseQuestions(raw);
    if (!qs.length) {
      setError("Couldn't find any questions. Check the format matches the example below (question, lettered options, an Answer: line, blank line between questions).");
      return;
    }
    setQuestions(qs);
  };

  const updateQ = (id, patch) => setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const updateOpt = (id, idx, val) => setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));
  const removeQ = (id) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  const handlePublish = async () => {
    setPublishing(true);
    let code = genCode();
    // avoid rare collisions
    for (let i = 0; i < 5; i++) {
      const existing = await getDoc(doc(db, "quizzes", code));
      if (!existing.exists()) break;
      code = genCode();
    }
    const quiz = {
      code,
      ownerId: user.uid,
      title: title || "Untitled test",
      durationMinutes: Number(duration) || 20,
      violationLimit: Number(violationLimit) || 3,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options.map((text, i) => ({ text, isCorrect: i === Number(q.correctIndex) })),
      })),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "quizzes", code), quiz);
    setPublishedCode(code);
    setPublishing(false);
  };

  if (publishedCode) {
    return (
      <div className="qp-card">
        <div className="qp-stamp qp-mono">PUBLISHED</div>
        <div className="qp-card-inner">
          <h1 className="qp-display qp-h1">Test is live</h1>
          <p className="qp-sub">Share this code with students, along with the join link.</p>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div className="qp-code qp-mono" style={{ fontSize: 28, padding: "10px 22px" }}>{publishedCode}</div>
          </div>
          <button className="qp-btn qp-btn-primary" onClick={() => nav(`/results/${publishedCode}`)} style={{ width: "100%", justifyContent: "center" }}>
            View results dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions) {
    return (
      <div className="qp-card">
        <div className="qp-card-inner">
          <span className="qp-label">Review &amp; configure</span>
          <h1 className="qp-display qp-h1">{questions.length} questions found</h1>
          <p className="qp-sub">Double-check the correct answer is marked for each question before publishing.</p>

          <div style={{ marginBottom: 20 }}>
            <label className="qp-label">Test title</label>
            <input className="qp-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit 3 — Cell Biology" />
          </div>
          <div className="qp-row" style={{ marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label className="qp-label">Duration (minutes)</label>
              <input className="qp-input" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="qp-label">Auto-submit after (violations)</label>
              <input className="qp-input" type="number" min="1" value={violationLimit} onChange={(e) => setViolationLimit(e.target.value)} />
            </div>
          </div>

          <hr className="qp-perf" style={{ marginBottom: 20 }} />

          {questions.map((q, qi) => (
            <div key={q.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #EFEBDF" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="qp-label" style={{ marginBottom: 8 }}>Question {qi + 1}</span>
                <button className="qp-btn-danger" onClick={() => removeQ(q.id)}><Trash2 size={15} /></button>
              </div>
              <textarea className="qp-textarea" style={{ minHeight: 50, marginBottom: 10, fontFamily: "Inter" }} value={q.question} onChange={(e) => updateQ(q.id, { question: e.target.value })} />
              {q.options.map((opt, oi) => (
                <div key={oi} className="qp-row" style={{ marginBottom: 6, alignItems: "center" }}>
                  <input type="radio" checked={Number(q.correctIndex) === oi} onChange={() => updateQ(q.id, { correctIndex: oi })} />
                  <input className="qp-input" value={opt} onChange={(e) => updateOpt(q.id, oi, e.target.value)} />
                </div>
              ))}
            </div>
          ))}

          <div className="qp-row">
            <button className="qp-btn qp-btn-ghost" onClick={() => setQuestions(null)}><ArrowLeft size={16} /> Back to paste</button>
            <button className="qp-btn qp-btn-primary" disabled={publishing} onClick={handlePublish}>{publishing ? "Publishing…" : <>Publish test <Check size={16} /></>}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qp-card">
      <div className="qp-card-inner">
        <button className="qp-link" onClick={() => nav("/dashboard")} style={{ marginBottom: 16, textDecoration: "none" }}><ArrowLeft size={14} /> Back</button>
        <span className="qp-label">Step 1</span>
        <h1 className="qp-display qp-h1">Paste your questions</h1>
        <p className="qp-sub">Format each question like the example below — number, lettered options, an <code>Answer:</code> line, and a blank line between questions.</p>
        <textarea className="qp-textarea" style={{ minHeight: 220 }} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={PLACEHOLDER} />
        {error && <p className="qp-error" style={{ marginTop: 10 }}><AlertTriangle size={13} style={{ verticalAlign: -2 }} /> {error}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="qp-btn qp-btn-primary" disabled={!raw.trim()} onClick={handleParse}>
            <Sparkles size={16} /> Extract questions
          </button>
        </div>
      </div>
    </div>
  );
}
