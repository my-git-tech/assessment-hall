import { useLocation, useNavigate } from "react-router-dom";
import { fmtTime } from "../utils/shuffle";

export default function StudentResult() {
  const { state } = useLocation();
  const nav = useNavigate();
  const result = state?.result;

  if (!result) {
    nav("/join", { replace: true });
    return null;
  }

  return (
    <div className="qp-card">
      <div className="qp-stamp qp-mono">{result.autoSubmitted ? "AUTO-SUBMITTED" : "SUBMITTED"}</div>
      <div className="qp-card-inner" style={{ textAlign: "center" }}>
        <span className="qp-label">Test complete</span>
        <h1 className="qp-display" style={{ fontSize: 44, margin: "10px 0" }}>{result.score}/{result.total}</h1>
        <p className="qp-sub">
          Time taken: {fmtTime(result.timeTakenSec)}
          {result.violations > 0 ? ` · ${result.violations} flag${result.violations > 1 ? "s" : ""}` : ""}
        </p>
        <button className="qp-btn qp-btn-ghost" onClick={() => nav("/join")} style={{ marginTop: 16 }}>Done</button>
      </div>
    </div>
  );
}
