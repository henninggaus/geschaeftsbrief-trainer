import { QUESTIONS, FLASHCARDS, CATEGORIES } from '../data/questions.js';
import {
  createQuiz, currentQuestion, isAnswered, answerQuestion, nextQuestion, isFinished, getScore,
  createDeck, rateCard, nextCard, deckStats, serializeDeck, MAX_BOX,
} from '../logic/quiz.js';
import { esc, escLines } from '../util.js';
import { load, save } from '../storage.js';

const QUIZ_LENGTH = 10;

export function renderQuiz(root, { mode = 'quiz' } = {}) {
  root.innerHTML = `
    <section class="view">
      <header class="view-head">
        <h1>Quiz & Lernkarten</h1>
      </header>
      <div class="segmented" role="tablist">
        <button type="button" role="tab" data-mode="quiz">Quiz</button>
        <button type="button" role="tab" data-mode="cards">Lernkarten</button>
      </div>
      <div class="mode-body"></div>
    </section>`;
  const body = root.querySelector('.mode-body');

  function setMode(m) {
    mode = m;
    root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
    const fresh = document.createElement('div');
    body.replaceChildren(fresh);
    (m === 'quiz' ? quizMode : cardsMode)(fresh);
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (b && b.dataset.mode !== mode) setMode(b.dataset.mode);
  });
  setMode(mode);
}

function quizMode(root) {
  let quiz = null;
  let lastResult = null;
  let category = 'alle';

  function showStart() {
    const best = load('quiz-best', null);
    root.innerHTML = `
      <div class="card">
        <h2>Multiple Choice</h2>
        <p class="muted">${QUIZ_LENGTH} zufällige Fragen mit Erklärung und IHK-Notenschlüssel.</p>
        <label class="field">Themenbereich
          <select data-role="category">
            <option value="alle">Alle Themen (${QUESTIONS.length})</option>
            ${Object.entries(CATEGORIES).map(([id, name]) => `<option value="${id}" ${id === category ? 'selected' : ''}>${esc(name)} (${QUESTIONS.filter((q) => q.category === id).length})</option>`).join('')}
          </select>
        </label>
        <button type="button" class="btn primary block" data-action="start">Quiz starten</button>
        ${best ? `<p class="small muted">Bestes Ergebnis: ${best.percent} % (Note ${best.grade})</p>` : ''}
      </div>`;
  }

  function showQuestion() {
    if (isFinished(quiz)) return showScore();
    const q = currentQuestion(quiz);
    const answered = isAnswered(quiz);
    const n = quiz.current + 1;
    const total = quiz.questions.length;
    root.innerHTML = `
      <div class="row"><span class="muted small">Frage ${n}/${total} · ${esc(CATEGORIES[q.category])}</span>
      <span class="muted small">${quiz.answers.filter((a) => a.correct).length} richtig</span></div>
      <div class="progress"><span style="width:${((n - 1) / total) * 100}%"></span></div>
      <h2 class="question">${esc(q.question)}</h2>
      <div class="options">
        ${q.options.map((o, i) => {
          let cls = '';
          if (answered) cls = i === q.answer ? 'correct' : i === lastResult.chosen ? 'wrong' : 'dim';
          return `<button type="button" class="option ${cls}" data-answer="${i}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
        }).join('')}
      </div>
      ${answered ? `
        <div class="feedback ${lastResult.correct ? 'ok' : 'bad'}" role="status">
          <strong>${lastResult.correct ? '✔ Richtig' : '✘ Leider falsch'}</strong>
          <p>${esc(lastResult.explanation)}</p>
        </div>
        <button type="button" class="btn primary block" data-action="next">${n < total ? 'Nächste Frage' : 'Auswertung'}</button>` : ''}`;
  }

  function showScore() {
    const s = getScore(quiz);
    const best = load('quiz-best', null);
    if (!best || s.percent > best.percent) save('quiz-best', { percent: s.percent, grade: s.grade });
    root.innerHTML = `
      <div class="card score">
        <div class="score-num">${s.correct}/${s.total}</div>
        <div>${s.percent} % · Note ${s.grade} (${s.label})</div>
      </div>
      ${s.wrong.length ? `<h2>Wiederholen</h2><ul class="review">${s.wrong.map((q) => `<li><strong>${esc(q.question)}</strong><br>${esc(q.options[q.answer])} – <span class="small">${esc(q.explanation)}</span></li>`).join('')}</ul>` : '<p class="note ok">Alles richtig – hervorragend!</p>'}
      <button type="button" class="btn primary block" data-action="restart">Neues Quiz</button>`;
  }

  root.addEventListener('change', (e) => {
    if (e.target.dataset.role === 'category') category = e.target.value;
  });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action],[data-answer]');
    if (!t) return;
    if (t.dataset.action === 'start') {
      quiz = createQuiz(QUESTIONS, { count: QUIZ_LENGTH, category });
      showQuestion();
    } else if (t.dataset.answer !== undefined) {
      ({ quiz, result: lastResult } = answerQuestion(quiz, Number(t.dataset.answer)));
      showQuestion();
    } else if (t.dataset.action === 'next') {
      quiz = nextQuestion(quiz);
      showQuestion();
    } else if (t.dataset.action === 'restart') {
      showStart();
    }
  });

  showStart();
}

function cardsMode(root) {
  let deck = createDeck(FLASHCARDS, load('deck', {}));
  let card = nextCard(deck);
  let flipped = false;

  function show() {
    const stats = deckStats(deck);
    root.innerHTML = `
      <div class="boxes" aria-label="Leitner-Fächer">
        ${stats.boxes.map((n, i) => `<div class="box ${card.box === i + 1 ? 'current' : ''}"><span>${n}</span><small>Fach ${i + 1}</small></div>`).join('')}
      </div>
      <button type="button" class="flashcard ${flipped ? 'flipped' : ''}" data-action="flip" aria-label="Karte umdrehen">
        <span class="face front"><small>Fach ${card.box}/${MAX_BOX}</small><strong>${esc(card.front)}</strong><small class="muted">Tippen zum Umdrehen</small></span>
        <span class="face back">${escLines(card.back)}</span>
      </button>
      <div class="row gap">
        <button type="button" class="btn bad" data-rate="0" ${flipped ? '' : 'disabled'}>Nochmal</button>
        <button type="button" class="btn ok" data-rate="1" ${flipped ? '' : 'disabled'}>Gewusst</button>
      </div>
      <p class="small muted center">${stats.mastered} von ${stats.total} Karten im letzten Fach (${stats.percent} %)
      · <button type="button" class="link" data-action="reset">zurücksetzen</button></p>`;
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action],[data-rate]');
    if (!t) return;
    if (t.dataset.action === 'flip') {
      flipped = !flipped;
      root.querySelector('.flashcard').classList.toggle('flipped', flipped);
      root.querySelectorAll('[data-rate]').forEach((b) => { b.disabled = !flipped; });
      return;
    }
    if (t.dataset.rate !== undefined) {
      deck = rateCard(deck, card.id, t.dataset.rate === '1');
      save('deck', serializeDeck(deck));
      card = nextCard(deck, card.id);
    } else if (t.dataset.action === 'reset') {
      deck = createDeck(FLASHCARDS);
      save('deck', {});
      card = nextCard(deck);
    }
    flipped = false;
    show();
  });

  show();
}
