// Expects blocks separated by a blank line, each shaped like:
//
// 1. What is the capital of France?
// A) Berlin
// B) Madrid
// C) Paris
// D) Rome
// Answer: C
//
// Numbering (1. / 1)) and option markers (A) / A. / (A)) are both accepted.
// The answer line can say "Answer:" or "Ans:" and take a letter or full text.
export function parseQuestions(raw) {
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const questions = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    let questionLine = lines[0].replace(/^\d+[.)]\s*/, "");
    const options = [];
    let answerLetter = null;
    let answerText = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const ansMatch = line.match(/^(answer|ans)\s*[:\-]\s*(.+)$/i);
      if (ansMatch) {
        const val = ansMatch[2].trim();
        const letterMatch = val.match(/^\(?([A-Da-d])\)?$/);
        if (letterMatch) answerLetter = letterMatch[1].toUpperCase();
        else answerText = val;
        continue;
      }
      const optMatch = line.match(/^\(?([A-Da-d])[).]\s*(.+)$/);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }
      // continuation of the question text (wrapped line before options start)
      if (options.length === 0) questionLine += " " + line;
    }

    if (!questionLine || options.length < 2) continue;

    let correctIndex = 0;
    if (answerLetter) {
      correctIndex = answerLetter.charCodeAt(0) - "A".charCodeAt(0);
    } else if (answerText) {
      const idx = options.findIndex((o) => o.toLowerCase() === answerText.toLowerCase());
      correctIndex = idx >= 0 ? idx : 0;
    }
    correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1));

    questions.push({
      id: uid(),
      question: questionLine.trim(),
      options,
      correctIndex,
    });
  }

  return questions;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
