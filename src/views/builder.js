import { DOCUMENT_TYPES, LEGAL_NOTES, SENDER } from '../data/documents.js';
import {
  getDocumentType, createBuild, currentStep, selectOption, advance, evaluateBuild, assembleLetter, letterToText,
} from '../logic/builder.js';
import { esc } from '../util.js';
import { load, save } from '../storage.js';

export function renderBuilder(root) {
  let type = null;
  let build = null;
  let feedback = null;

  function showChooser() {
    const done = load('builder-best', {});
    root.innerHTML = `
      <section class="view">
        <header class="view-head">
          <h1>Dokumenten-Baukasten</h1>
          <p class="muted">Stellen Sie einen Geschäftsbrief Schritt für Schritt aus Textbausteinen zusammen.</p>
        </header>
        <div class="tiles">
          ${DOCUMENT_TYPES.map((t) => `
            <button type="button" class="tile" data-type="${t.id}">
              <span class="tile-icon" aria-hidden="true">${t.icon}</span>
              <span class="tile-title">${esc(t.name)}</span>
              <span class="tile-text">${esc(t.description)}</span>
              ${done[t.id] != null ? `<span class="badge">Bestwert ${done[t.id]} %</span>` : ''}
            </button>`).join('')}
        </div>
      </section>`;
  }

  function showStep() {
    const step = currentStep(type, build);
    if (!step) return showResult();
    const chosenId = build.selections[step.id];
    const progress = Math.round((build.step / type.steps.length) * 100);

    root.innerHTML = `
      <section class="view">
        <header class="view-head row">
          <button type="button" class="link" data-action="back">‹ Übersicht</button>
          <span class="muted small">${esc(type.name)} · Schritt ${build.step + 1}/${type.steps.length}</span>
        </header>
        <div class="progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
        ${build.step === 0 ? `<p class="note">⚖️ ${esc(LEGAL_NOTES[type.id])}</p>` : ''}
        <h2>${esc(step.title)}</h2>
        <p class="muted">${esc(step.hint)}</p>
        <div class="options">
          ${step.options.map((o) => {
            let cls = '';
            if (chosenId) cls = o.correct ? 'correct' : o.id === chosenId ? 'wrong' : 'dim';
            return `<button type="button" class="option ${cls}" data-option="${o.id}" ${chosenId ? 'disabled' : ''}>${esc(o.text)}</button>`;
          }).join('')}
        </div>
        ${feedback ? `
          <div class="feedback ${feedback.option.correct ? 'ok' : 'bad'}" role="status">
            <strong>${feedback.option.correct ? '✔ Richtig' : '✘ Nicht optimal'}</strong>
            <p>${esc(feedback.option.feedback)}</p>
            ${feedback.option.correct ? '' : `<p class="small"><strong>Besser:</strong> ${esc(feedback.correctOption.text)}</p>`}
          </div>
          <button type="button" class="btn primary block" data-action="next">${build.step + 1 < type.steps.length ? 'Weiter' : 'Brief ansehen'}</button>` : ''}
      </section>`;
  }

  function showResult() {
    const ev = evaluateBuild(type, build);
    const letter = assembleLetter(type, build, SENDER);
    const best = load('builder-best', {});
    best[type.id] = Math.max(best[type.id] ?? 0, ev.percent);
    save('builder-best', best);

    root.innerHTML = `
      <section class="view">
        <header class="view-head row">
          <button type="button" class="link" data-action="back">‹ Übersicht</button>
          <span class="muted small">${esc(type.name)} · Ergebnis</span>
        </header>
        <div class="card score">
          <div class="score-num">${ev.correct}/${ev.total}</div>
          <div>${ev.percent} % · Note ${ev.grade} (${ev.label})</div>
        </div>
        ${ev.results.some((r) => !r.correct) ? `
          <h2>Verbesserungen</h2>
          <ul class="review">
            ${ev.results.filter((r) => !r.correct).map((r) => `
              <li><strong>${esc(r.title)}:</strong> ${esc(r.chosen?.feedback)}<br><span class="small">Besser: ${esc(r.correctOption.text)}</span></li>`).join('')}
          </ul>` : '<p class="note ok">Perfekt – alle Bausteine sind DIN-gerecht gewählt.</p>'}
        <h2>Ihr Brief</h2>
        ${renderLetter(letter)}
        <div class="row gap">
          <button type="button" class="btn" data-action="copy">Text kopieren</button>
          <button type="button" class="btn primary" data-action="restart">Nochmal</button>
        </div>
      </section>`;
    root.dataset.letterText = letterToText(letter);
  }

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-type],[data-option],[data-action]');
    if (!t) return;
    if (t.dataset.type) {
      type = getDocumentType(DOCUMENT_TYPES, t.dataset.type);
      build = createBuild(type);
      feedback = null;
      showStep();
    } else if (t.dataset.option) {
      const res = selectOption(type, build, t.dataset.option);
      build = res.build;
      feedback = res;
      showStep();
    } else if (t.dataset.action === 'next') {
      build = advance(type, build);
      feedback = null;
      showStep();
      root.scrollIntoView({ block: 'start' });
    } else if (t.dataset.action === 'restart') {
      build = createBuild(type);
      feedback = null;
      showStep();
    } else if (t.dataset.action === 'back') {
      showChooser();
    } else if (t.dataset.action === 'copy') {
      try {
        await navigator.clipboard.writeText(root.dataset.letterText);
        t.textContent = 'Kopiert ✔';
      } catch {
        t.textContent = 'Kopieren nicht möglich';
      }
    }
  });

  showChooser();
}

/** Verkleinerte Briefvorschau mit DIN-Abständen (Leerzeilen als .blank). */
function renderLetter(l) {
  const blank = (n = 1) => '<div class="blank"></div>'.repeat(n);
  return `
    <article class="letter" aria-label="Briefvorschau">
      <div class="l-head">${esc(l.company)}</div>
      <div class="l-fields">
        <div class="l-address">
          <div class="l-zusatz">
            <div class="l-return">${esc(l.returnLine)}</div>
            ${l.notice ? `<div class="l-notice">${esc(l.notice)}</div>` : ''}
          </div>
          ${l.recipient.map((r) => `<div>${esc(r)}</div>`).join('')}
        </div>
        <dl class="l-info">${l.info.map(([k, v]) => `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
      ${blank(2)}
      <div class="l-subject">${esc(l.subject)}</div>
      ${blank(2)}
      <div>${esc(l.salutation)}</div>
      ${blank()}
      ${l.body.map((p) => `<p>${esc(p)}</p>`).join(blank())}
      ${blank()}
      <div>${esc(l.closing)}</div>
      ${blank()}
      <div>${esc(l.company)}</div>
      ${blank(3)}
      <div>${esc(l.signer)}</div>
      ${l.attachments.length ? `${blank()}<div class="l-subject">${l.attachments.length > 1 ? 'Anlagen' : 'Anlage'}</div>${l.attachments.map((a) => `<div>${esc(a)}</div>`).join('')}` : ''}
      <footer class="l-footer">${l.footer.map((f) => `<div>${esc(f)}</div>`).join('')}</footer>
    </article>`;
}
