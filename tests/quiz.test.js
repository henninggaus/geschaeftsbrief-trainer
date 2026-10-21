import { describe, it, expect } from 'vitest';
import {
  shuffle, shuffleOptions, validateQuestion, createQuiz, currentQuestion, answerQuestion, nextQuestion,
  isFinished, getScore, gradeFor, createDeck, rateCard, nextCard, deckStats, serializeDeck, MAX_BOX,
} from '../src/logic/quiz.js';
import { QUESTIONS, FLASHCARDS, CATEGORIES } from '../src/data/questions.js';

/** Deterministischer Zufallsgenerator (Mulberry32). */
function seeded(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sample = [
  { id: 'q1', category: 'a', question: 'Eins?', options: ['x', 'y', 'z'], answer: 1, explanation: 'weil' },
  { id: 'q2', category: 'b', question: 'Zwei?', options: ['x', 'y'], answer: 0, explanation: 'weil' },
  { id: 'q3', category: 'a', question: 'Drei?', options: ['x', 'y', 'z', 'w'], answer: 3, explanation: 'weil' },
];

describe('Fragenkatalog', () => {
  it('alle Fragen sind gültig und haben eindeutige IDs', () => {
    for (const q of QUESTIONS) expect(validateQuestion(q), q.id).toEqual([]);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });

  it('jede Kategorie ist bekannt und hat genug Fragen für ein Quiz', () => {
    for (const q of QUESTIONS) expect(CATEGORIES).toHaveProperty(q.category);
    for (const cat of Object.keys(CATEGORIES)) {
      expect(QUESTIONS.filter((q) => q.category === cat).length).toBeGreaterThanOrEqual(10);
    }
  });

  it('Lernkarten haben eindeutige IDs sowie Vorder- und Rückseite', () => {
    expect(new Set(FLASHCARDS.map((c) => c.id)).size).toBe(FLASHCARDS.length);
    for (const c of FLASHCARDS) {
      expect(c.front).toBeTruthy();
      expect(c.back).toBeTruthy();
    }
  });

  it('validateQuestion erkennt fehlerhafte Fragen', () => {
    expect(validateQuestion({ id: 'x', question: 'Q', options: ['a'], answer: 0, explanation: 'e' })).toContain('mindestens zwei Antworten nötig');
    expect(validateQuestion({ id: 'x', question: 'Q', options: ['a', 'b'], answer: 2, explanation: 'e' })).toContain('answer verweist auf keine Antwort');
    expect(validateQuestion({ id: 'x', question: 'Q', options: ['a', 'a'], answer: 0, explanation: 'e' })).toContain('doppelte Antworten');
    expect(validateQuestion(null).length).toBeGreaterThan(0);
  });
});

describe('Mischen', () => {
  it('shuffle behält alle Elemente und verändert die Eingabe nicht', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input, seeded(1));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('shuffleOptions verschiebt den Index der richtigen Antwort korrekt', () => {
    for (let s = 0; s < 50; s++) {
      for (const q of QUESTIONS) {
        const mixed = shuffleOptions(q, seeded(s));
        expect(mixed.options[mixed.answer]).toBe(q.options[q.answer]);
        expect([...mixed.options].sort()).toEqual([...q.options].sort());
      }
    }
  });
});

describe('Quiz-Ablauf', () => {
  it('createQuiz begrenzt die Anzahl und filtert nach Kategorie', () => {
    expect(createQuiz(QUESTIONS, { count: 10, rng: seeded(2) }).questions).toHaveLength(10);
    const quiz = createQuiz(sample, { category: 'a', rng: seeded(3) });
    expect(quiz.questions.map((q) => q.id).sort()).toEqual(['q1', 'q3']);
    expect(() => createQuiz(sample, { category: 'gibtsnicht' })).toThrow();
  });

  it('wertet richtige und falsche Antworten aus und berechnet die Note', () => {
    let quiz = createQuiz(sample, { shuffled: false });
    let res = answerQuestion(quiz, 1);
    expect(res.result).toMatchObject({ correct: true, correctIndex: 1, explanation: 'weil' });
    quiz = nextQuestion(res.quiz);

    res = answerQuestion(quiz, 1);
    expect(res.result.correct).toBe(false);
    expect(res.result.correctIndex).toBe(0);
    quiz = nextQuestion(res.quiz);

    quiz = nextQuestion(answerQuestion(quiz, 3).quiz);
    expect(isFinished(quiz)).toBe(true);
    expect(currentQuestion(quiz)).toBeNull();

    const score = getScore(quiz);
    expect(score).toMatchObject({ correct: 2, total: 3, percent: 67, grade: 3, label: 'befriedigend' });
    expect(score.wrong.map((q) => q.id)).toEqual(['q2']);
  });

  it('verhindert doppelte Antworten, Überspringen und ungültige Eingaben', () => {
    const quiz = createQuiz(sample, { shuffled: false });
    expect(() => nextQuestion(quiz)).toThrow(/zuerst/);
    expect(() => answerQuestion(quiz, 7)).toThrow(/Ungültige/);
    const { quiz: answered } = answerQuestion(quiz, 0);
    expect(() => answerQuestion(answered, 1)).toThrow(/bereits beantwortet/);
    expect(quiz.answers).toEqual([]); // Eingabe bleibt unverändert
  });

  it('gradeFor nutzt den IHK-Notenschlüssel', () => {
    expect(gradeFor(100).grade).toBe(1);
    expect(gradeFor(92).grade).toBe(1);
    expect(gradeFor(91).grade).toBe(2);
    expect(gradeFor(81).grade).toBe(2);
    expect(gradeFor(67).grade).toBe(3);
    expect(gradeFor(50).grade).toBe(4);
    expect(gradeFor(49).grade).toBe(5);
    expect(gradeFor(29).grade).toBe(6);
  });
});

describe('Lernkarten (Leitner)', () => {
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('neue Karten starten in Fach 1, gespeicherte Fächer werden übernommen und begrenzt', () => {
    const deck = createDeck(cards, { b: { box: 3, seen: 5 }, c: { box: 99 } });
    expect(deck.map((c) => c.box)).toEqual([1, 3, MAX_BOX]);
  });

  it('gewusst rückt ein Fach vor (max. 5), nicht gewusst fällt in Fach 1', () => {
    let deck = createDeck(cards);
    deck = rateCard(deck, 'a', true, 1);
    deck = rateCard(deck, 'a', true, 2);
    expect(deck[0].box).toBe(3);
    for (let i = 0; i < 10; i++) deck = rateCard(deck, 'a', true, 3 + i);
    expect(deck[0].box).toBe(MAX_BOX);
    deck = rateCard(deck, 'a', false, 20);
    expect(deck[0].box).toBe(1);
    expect(() => rateCard(deck, 'zzz', true)).toThrow();
  });

  it('nextCard wählt das niedrigste Fach und darin die älteste Karte', () => {
    let deck = createDeck(cards);
    deck = rateCard(deck, 'a', true, 10); // a → Fach 2
    deck = rateCard(deck, 'b', false, 5); // b bleibt Fach 1, zuletzt gesehen 5
    expect(nextCard(deck).id).toBe('c'); // c: Fach 1, nie gesehen
    expect(nextCard(deck, 'c').id).toBe('b');
    expect(nextCard([{ id: 'x', box: 1, seen: 0 }], 'x').id).toBe('x');
    expect(nextCard([])).toBeNull();
  });

  it('deckStats und serializeDeck', () => {
    let deck = createDeck(cards, { a: { box: 5 } });
    deck = rateCard(deck, 'b', true, 1);
    expect(deckStats(deck)).toEqual({ boxes: [1, 1, 0, 0, 1], mastered: 1, total: 3, percent: 33 });
    const saved = serializeDeck(deck);
    expect(createDeck(cards, saved).map((c) => c.box)).toEqual([5, 2, 1]);
  });
});
