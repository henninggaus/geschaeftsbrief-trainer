/**
 * Reine Quiz- und Lernkarten-Logik ohne DOM-Zugriff.
 * Alle Funktionen geben neue Objekte zurück und verändern ihre Eingaben nicht.
 */

/** Fisher-Yates-Mischen mit austauschbarem Zufallsgenerator (für Tests). */
export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function validateQuestion(q) {
  const errors = [];
  if (!q || typeof q.id !== 'string' || !q.id) errors.push('id fehlt');
  if (!q?.question) errors.push('Fragetext fehlt');
  if (!Array.isArray(q?.options) || q.options.length < 2) errors.push('mindestens zwei Antworten nötig');
  else {
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
      errors.push('answer verweist auf keine Antwort');
    }
    if (new Set(q.options).size !== q.options.length) errors.push('doppelte Antworten');
  }
  if (!q?.explanation) errors.push('Erklärung fehlt');
  return errors;
}

/** Mischt die Antworten einer Frage und passt den Index der richtigen Antwort an. */
export function shuffleOptions(question, rng = Math.random) {
  const order = shuffle(question.options.map((_, i) => i), rng);
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  };
}

export function createQuiz(questions, { count, category, shuffled = true, rng = Math.random } = {}) {
  let pool = category && category !== 'alle' ? questions.filter((q) => q.category === category) : questions;
  if (shuffled) pool = shuffle(pool, rng).map((q) => shuffleOptions(q, rng));
  if (count) pool = pool.slice(0, count);
  if (!pool.length) throw new Error('Keine Fragen für diese Auswahl vorhanden.');
  return { questions: pool, current: 0, answers: [] };
}

export function currentQuestion(quiz) {
  return quiz.questions[quiz.current] ?? null;
}

export function isAnswered(quiz) {
  return quiz.answers.length > quiz.current;
}

export function answerQuestion(quiz, optionIndex) {
  const q = currentQuestion(quiz);
  if (!q) throw new Error('Quiz ist bereits beendet.');
  if (isAnswered(quiz)) throw new Error('Frage wurde bereits beantwortet.');
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= q.options.length) {
    throw new Error('Ungültige Antwort.');
  }
  const correct = optionIndex === q.answer;
  const result = { questionId: q.id, chosen: optionIndex, correct };
  return {
    quiz: { ...quiz, answers: [...quiz.answers, result] },
    result: { ...result, correctIndex: q.answer, explanation: q.explanation },
  };
}

export function nextQuestion(quiz) {
  if (!isAnswered(quiz)) throw new Error('Bitte zuerst die aktuelle Frage beantworten.');
  return { ...quiz, current: quiz.current + 1 };
}

export function isFinished(quiz) {
  return quiz.current >= quiz.questions.length;
}

/** IHK-Notenschlüssel für Prozentpunkte. */
export function gradeFor(percent) {
  if (percent >= 92) return { grade: 1, label: 'sehr gut' };
  if (percent >= 81) return { grade: 2, label: 'gut' };
  if (percent >= 67) return { grade: 3, label: 'befriedigend' };
  if (percent >= 50) return { grade: 4, label: 'ausreichend' };
  if (percent >= 30) return { grade: 5, label: 'mangelhaft' };
  return { grade: 6, label: 'ungenügend' };
}

export function getScore(quiz) {
  const total = quiz.questions.length;
  const correct = quiz.answers.filter((a) => a.correct).length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const wrong = quiz.answers
    .filter((a) => !a.correct)
    .map((a) => quiz.questions.find((q) => q.id === a.questionId));
  return { correct, total, percent, ...gradeFor(percent), wrong };
}

/* ---------- Lernkarten (Leitner-System mit 5 Fächern) ---------- */

export const MAX_BOX = 5;

export function createDeck(cards, saved = {}) {
  return cards.map((card) => ({
    ...card,
    box: clampBox(saved[card.id]?.box ?? 1),
    seen: saved[card.id]?.seen ?? 0,
  }));
}

/** Gewusst → ein Fach weiter, nicht gewusst → zurück in Fach 1. */
export function rateCard(deck, id, knew, now = Date.now()) {
  if (!deck.some((c) => c.id === id)) throw new Error(`Unbekannte Karte "${id}"`);
  return deck.map((c) =>
    c.id === id ? { ...c, box: knew ? Math.min(c.box + 1, MAX_BOX) : 1, seen: now } : c,
  );
}

/** Nächste Karte: niedrigstes Fach zuerst, darin die am längsten nicht gesehene. */
export function nextCard(deck, excludeId) {
  const candidates = deck.length > 1 ? deck.filter((c) => c.id !== excludeId) : deck;
  if (!candidates.length) return null;
  return candidates.reduce((best, c) =>
    c.box < best.box || (c.box === best.box && c.seen < best.seen) ? c : best,
  );
}

export function deckStats(deck) {
  const boxes = Array.from({ length: MAX_BOX }, (_, i) => deck.filter((c) => c.box === i + 1).length);
  const mastered = boxes[MAX_BOX - 1];
  return { boxes, mastered, total: deck.length, percent: deck.length ? Math.round((mastered / deck.length) * 100) : 0 };
}

export function serializeDeck(deck) {
  return Object.fromEntries(deck.map((c) => [c.id, { box: c.box, seen: c.seen }]));
}

function clampBox(box) {
  return Math.min(Math.max(Number.parseInt(box, 10) || 1, 1), MAX_BOX);
}
