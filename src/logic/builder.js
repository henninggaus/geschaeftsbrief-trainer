/**
 * Logik des Dokumenten-Baukastens: Auswahl von Textbausteinen, Auswertung
 * und Zusammensetzen des fertigen Briefs.
 */
import { gradeFor } from './quiz.js';

export function getDocumentType(types, id) {
  const type = types.find((t) => t.id === id);
  if (!type) throw new Error(`Unbekannter Dokumenttyp "${id}"`);
  return type;
}

export function createBuild(type) {
  return { typeId: type.id, step: 0, selections: {} };
}

export function currentStep(type, build) {
  return type.steps[build.step] ?? null;
}

export function selectOption(type, build, optionId) {
  const step = currentStep(type, build);
  if (!step) throw new Error('Alle Schritte sind bereits abgeschlossen.');
  const option = step.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Unbekannter Baustein "${optionId}"`);
  return {
    build: { ...build, selections: { ...build.selections, [step.id]: optionId } },
    option,
    correctOption: step.options.find((o) => o.correct),
  };
}

export function advance(type, build) {
  const step = currentStep(type, build);
  if (!step) throw new Error('Alle Schritte sind bereits abgeschlossen.');
  if (!build.selections[step.id]) throw new Error('Bitte zuerst einen Baustein auswählen.');
  return { ...build, step: build.step + 1 };
}

export function isComplete(type, build) {
  return type.steps.every((s) => build.selections[s.id]);
}

export function evaluateBuild(type, build) {
  const results = type.steps.map((step) => {
    const chosen = step.options.find((o) => o.id === build.selections[step.id]) ?? null;
    return {
      stepId: step.id,
      title: step.title,
      chosen,
      correct: Boolean(chosen?.correct),
      correctOption: step.options.find((o) => o.correct),
    };
  });
  const correct = results.filter((r) => r.correct).length;
  const percent = Math.round((correct / results.length) * 100);
  return { results, correct, total: results.length, percent, ...gradeFor(percent) };
}

/**
 * Setzt den Brief in DIN-5008-Reihenfolge zusammen. Leerzeilen werden als
 * leere Strings dargestellt, damit die Vorschau die Abstände zeigen kann.
 */
export function assembleLetter(type, build, sender) {
  const text = (stepId) => {
    const step = type.steps.find((s) => s.id === stepId);
    return step?.options.find((o) => o.id === build.selections[stepId])?.text ?? null;
  };
  const bodySteps = type.steps.filter((s) => !['betreff', 'anrede', 'gruss'].includes(s.id));
  const body = bodySteps.map((s) => text(s.id)).filter(Boolean);
  const attachments = type.id === 'zahlungserinnerung' ? ['Rechnungskopie'] : [];

  return {
    returnLine: sender.returnLine,
    notice: type.notice ?? null,
    recipient: [...type.recipient],
    info: [
      ['Ihr Zeichen', 'kr'],
      ['Unser Zeichen', 'we'],
      ['Name', sender.signer],
      ['Datum', type.date],
    ],
    subject: text('betreff'),
    salutation: text('anrede'),
    body,
    closing: text('gruss'),
    company: sender.company,
    signer: sender.signer,
    attachments,
    footer: [...sender.footer],
  };
}

/** Reiner Text mit Leerzeilen nach DIN 5008 (z. B. zum Kopieren). */
export function letterToText(letter) {
  const lines = [];
  const blank = (n = 1) => { for (let i = 0; i < n; i++) lines.push(''); };
  if (letter.subject) lines.push(letter.subject);
  blank(2);
  if (letter.salutation) lines.push(letter.salutation);
  blank();
  letter.body.forEach((p, i) => {
    if (i) blank();
    lines.push(p);
  });
  blank();
  if (letter.closing) lines.push(letter.closing);
  blank();
  lines.push(letter.company);
  blank(3);
  lines.push(letter.signer);
  if (letter.attachments.length) {
    blank();
    lines.push(letter.attachments.length > 1 ? 'Anlagen' : 'Anlage', ...letter.attachments);
  }
  return lines.join('\n');
}
