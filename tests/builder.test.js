import { describe, it, expect } from 'vitest';
import { DOCUMENT_TYPES, SENDER, LEGAL_NOTES } from '../src/data/documents.js';
import {
  getDocumentType, createBuild, currentStep, selectOption, advance, isComplete, evaluateBuild,
  assembleLetter, letterToText,
} from '../src/logic/builder.js';

function buildWith(type, pick) {
  let build = createBuild(type);
  while (currentStep(type, build)) {
    const step = currentStep(type, build);
    build = advance(type, selectOption(type, build, pick(step).id).build);
  }
  return build;
}
const correct = (step) => step.options.find((o) => o.correct);
const wrong = (step) => step.options.find((o) => !o.correct);

describe('Baukasten-Daten', () => {
  it('enthält Anfrage, Angebot, Zahlungserinnerung und Mahnung', () => {
    expect(DOCUMENT_TYPES.map((t) => t.id)).toEqual(['anfrage', 'angebot', 'zahlungserinnerung', 'mahnung']);
  });

  it.each(DOCUMENT_TYPES.map((t) => [t.id, t]))('%s: jeder Schritt hat genau einen richtigen Baustein mit Erklärungen', (_, type) => {
    expect(LEGAL_NOTES[type.id]).toBeTruthy();
    expect(type.date).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    expect(type.recipient.length).toBeLessThanOrEqual(6);
    for (const step of type.steps) {
      expect(step.options.filter((o) => o.correct)).toHaveLength(1);
      expect(new Set(step.options.map((o) => o.id)).size).toBe(step.options.length);
      for (const o of step.options) expect(o.feedback).toBeTruthy();
    }
    expect(type.steps.map((s) => s.id)).toEqual(expect.arrayContaining(['betreff', 'anrede', 'gruss']));
  });

  it('richtige Betreffzeilen enthalten weder Leitwort noch Schlusspunkt', () => {
    for (const type of DOCUMENT_TYPES) {
      const betreff = correct(type.steps.find((s) => s.id === 'betreff')).text;
      expect(betreff).not.toMatch(/^Betr/);
      expect(betreff).not.toMatch(/\.$/);
    }
  });

  it('die richtige Mahnfrist nennt ein konkretes Datum statt „umgehend“', () => {
    const frist = correct(getDocumentType(DOCUMENT_TYPES, 'mahnung').steps.find((s) => s.id === 'frist'));
    expect(frist.text).toMatch(/\d{1,2}\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \d{4}/);
    expect(frist.text).not.toMatch(/umgehend|sofort/);
  });

  it('die Geschäftsangaben enthalten die gesetzlichen Pflichtangaben einer GmbH', () => {
    const footer = SENDER.footer.join(' ');
    expect(footer).toMatch(/GmbH/);
    expect(footer).toMatch(/Sitz:/);
    expect(footer).toMatch(/Amtsgericht/);
    expect(footer).toMatch(/HRB \d+/);
    expect(footer).toMatch(/Geschäftsführer/);
  });
});

describe('Baukasten-Logik', () => {
  const type = getDocumentType(DOCUMENT_TYPES, 'mahnung');

  it('getDocumentType wirft bei unbekannten Typen', () => {
    expect(() => getDocumentType(DOCUMENT_TYPES, 'kuendigung')).toThrow();
  });

  it('erst auswählen, dann weiter', () => {
    const build = createBuild(type);
    expect(() => advance(type, build)).toThrow(/zuerst/);
    expect(() => selectOption(type, build, 'nope')).toThrow();
    const res = selectOption(type, build, wrong(type.steps[0]).id);
    expect(res.option.correct).toBe(false);
    expect(res.correctOption.correct).toBe(true);
    expect(build.selections).toEqual({});
  });

  it('nur richtige Bausteine → 100 % und Note 1', () => {
    const build = buildWith(type, correct);
    expect(isComplete(type, build)).toBe(true);
    expect(currentStep(type, build)).toBeNull();
    expect(() => selectOption(type, build, 'x')).toThrow();
    expect(evaluateBuild(type, build)).toMatchObject({ correct: type.steps.length, percent: 100, grade: 1 });
  });

  it('nur falsche Bausteine → 0 % mit Verbesserungsvorschlägen', () => {
    const ev = evaluateBuild(type, buildWith(type, wrong));
    expect(ev).toMatchObject({ correct: 0, percent: 0, grade: 6 });
    expect(ev.results.every((r) => r.correctOption.correct)).toBe(true);
  });

  it('setzt den Brief in DIN-Reihenfolge mit korrekten Leerzeilen zusammen', () => {
    const build = buildWith(type, correct);
    const letter = assembleLetter(type, build, SENDER);
    expect(letter.notice).toBe('Einschreiben');
    expect(letter.recipient).not.toContain('Einschreiben');
    expect(letter.info.find(([k]) => k === 'Datum')[1]).toBe('06.11.2026');

    const lines = letterToText(letter).split('\n');
    const at = (text) => lines.indexOf(text);
    const subject = at('2. Mahnung zu Rechnung Nr. 2026-0815');
    const salutation = at('Sehr geehrte Damen und Herren,');
    expect(subject).toBe(0);
    expect(salutation - subject).toBe(3); // zwei Leerzeilen dazwischen
    expect(lines[salutation + 1]).toBe(''); // eine Leerzeile vor dem Text
    const greeting = at('Mit freundlichen Grüßen');
    expect(lines[greeting - 1]).toBe('');
    expect(at(SENDER.signer) - at(SENDER.company)).toBe(4); // drei Leerzeilen für die Unterschrift
  });

  it('die Zahlungserinnerung führt die Rechnungskopie als Anlage auf', () => {
    const t = getDocumentType(DOCUMENT_TYPES, 'zahlungserinnerung');
    const text = letterToText(assembleLetter(t, buildWith(t, correct), SENDER)).split('\n');
    const anlage = text.indexOf('Anlage');
    expect(text[anlage - 1]).toBe('');
    expect(text[anlage + 1]).toBe('Rechnungskopie');
  });
});
