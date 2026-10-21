import { FLASHCARDS } from '../data/questions.js';
import { DOCUMENT_TYPES } from '../data/documents.js';
import { createDeck, deckStats } from '../logic/quiz.js';
import { load } from '../storage.js';

export function renderHome(root) {
  const deck = deckStats(createDeck(FLASHCARDS, load('deck', {})));
  const quizBest = load('quiz-best', null);
  const built = Object.keys(load('builder-best', {})).length;

  root.innerHTML = `
    <section class="view">
      <header class="hero">
        <h1>DIN 5008 Trainer</h1>
        <p>Geschäftsbriefe nach Form A und Form B sicher gestalten – für Ausbildung und Prüfung.</p>
      </header>
      <div class="tiles">
        <a class="tile" href="#/layout">
          <span class="tile-icon" aria-hidden="true">📐</span>
          <span class="tile-title">Layout-Visualizer</span>
          <span class="tile-text">Zonen, Maße und Abstände auf dem A4-Blatt antippen.</span>
        </a>
        <a class="tile" href="#/baukasten">
          <span class="tile-icon" aria-hidden="true">🧩</span>
          <span class="tile-title">Dokumenten-Baukasten</span>
          <span class="tile-text">Anfrage, Angebot, Zahlungserinnerung und Mahnung zusammenstellen.</span>
          <span class="badge">${built}/${DOCUMENT_TYPES.length} bearbeitet</span>
        </a>
        <a class="tile" href="#/quiz">
          <span class="tile-icon" aria-hidden="true">🎯</span>
          <span class="tile-title">Quiz</span>
          <span class="tile-text">Multiple Choice zu Schreibregeln und kaufmännischem Wissen.</span>
          ${quizBest ? `<span class="badge">Bestwert ${quizBest.percent} %</span>` : ''}
        </a>
        <a class="tile" href="#/karten">
          <span class="tile-icon" aria-hidden="true">🗂️</span>
          <span class="tile-title">Lernkarten</span>
          <span class="tile-text">Wiederholen mit dem Leitner-System.</span>
          <span class="badge">${deck.mastered}/${deck.total} gemeistert</span>
        </a>
      </div>
    </section>`;
}
