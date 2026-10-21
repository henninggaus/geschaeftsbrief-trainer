import {
  PAGE, MARGINS, LINE_MM, getZones, getZone, getMarks, getHeaderHeight, compareForms, formatMm, formatCm,
} from '../logic/layout.js';
import { ZONE_INFO } from '../data/zones.js';
import { esc } from '../util.js';
import { load, save } from '../storage.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderLayout(root) {
  const state = { form: load('layout-form', 'B'), selected: load('layout-zone', 'anschriftzone') };

  root.innerHTML = `
    <section class="view">
      <header class="view-head">
        <h1>Layout-Visualizer</h1>
        <p class="muted">Tippen Sie auf eine Zone, um Maße und Regeln zu sehen.</p>
      </header>
      <div class="segmented" role="radiogroup" aria-label="Briefform">
        <button type="button" role="radio" data-form="A">Form A <small>27 mm</small></button>
        <button type="button" role="radio" data-form="B">Form B <small>45 mm</small></button>
      </div>
      <div class="layout-grid">
        <figure class="sheet-wrap">
          <svg class="sheet" viewBox="-12 -4 ${PAGE.width + 16} ${PAGE.height + 8}" role="img" aria-label="A4-Briefbogen mit DIN-5008-Zonen"></svg>
          <figcaption class="muted small">A4 · 210 × 297 mm · Falz- und Lochmarken am linken Rand</figcaption>
        </figure>
        <div>
          <div class="chips" role="listbox" aria-label="Zonen"></div>
          <article class="card zone-detail" aria-live="polite"></article>
        </div>
      </div>
    </section>`;

  const svg = root.querySelector('svg');
  const chips = root.querySelector('.chips');
  const detail = root.querySelector('.zone-detail');

  buildSheet(svg);
  chips.innerHTML = Object.entries(ZONE_INFO)
    .map(([id, z]) => `<button type="button" class="chip" role="option" data-zone="${id}" style="--c:${z.color}">${esc(z.name)}</button>`)
    .join('');

  function update() {
    root.querySelectorAll('[data-form]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.form === state.form)));
    updateSheet(svg, state.form, state.selected);
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-selected', String(c.dataset.zone === state.selected)));
    detail.innerHTML = renderDetail(state.selected, state.form);
    detail.style.setProperty('--c', ZONE_INFO[state.selected].color);
    save('layout-form', state.form);
    save('layout-zone', state.selected);
  }

  root.addEventListener('click', (e) => {
    const formBtn = e.target.closest('[data-form]');
    const zoneEl = e.target.closest('[data-zone]');
    if (formBtn) state.form = formBtn.dataset.form;
    else if (zoneEl) state.selected = zoneEl.dataset.zone;
    else return;
    update();
  });
  svg.addEventListener('keydown', (e) => {
    const zoneEl = e.target.closest('[data-zone]');
    if (zoneEl && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      state.selected = zoneEl.dataset.zone;
      update();
    }
  });

  update();
}

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  parent?.appendChild(node);
  return node;
}

function buildSheet(svg) {
  el('rect', { class: 'paper', x: 0, y: 0, width: PAGE.width, height: PAGE.height, rx: 1.5 }, svg);
  // Randlinien des Textbereichs
  el('line', { class: 'guide', x1: MARGINS.left, y1: 0, x2: MARGINS.left, y2: PAGE.height }, svg);
  el('line', { class: 'guide', x1: PAGE.width - MARGINS.right, y1: 0, x2: PAGE.width - MARGINS.right, y2: PAGE.height }, svg);

  const zones = el('g', { class: 'zones' }, svg);
  getZones('A').forEach((z) => {
    const g = el('g', { class: 'zone', 'data-zone': z.id, tabindex: 0, role: 'button', 'aria-label': ZONE_INFO[z.id].name, style: `--c:${ZONE_INFO[z.id].color}` }, zones);
    el('rect', { rx: 0.8 }, g);
    const label = el('text', { 'dominant-baseline': 'middle' }, g);
    label.textContent = ZONE_INFO[z.id].name;
  });

  const marks = el('g', { class: 'marks' }, svg);
  ['fold1', 'fold2', 'punch'].forEach((id) => {
    el('line', { 'data-mark': id, x1: -8, x2: -2 }, marks);
    el('text', { 'data-mark-label': id, x: -11, 'text-anchor': 'start' }, marks);
  });
  el('text', { class: 'margin-label', x: MARGINS.left + 1, y: PAGE.height - 1.5 }, svg).textContent = '25 mm';
  el('text', { class: 'margin-label', x: PAGE.width - MARGINS.right - 1, y: PAGE.height - 1.5, 'text-anchor': 'end' }, svg).textContent = '20 mm';
}

function updateSheet(svg, form, selected) {
  getZones(form).forEach((z) => {
    const g = svg.querySelector(`.zone[data-zone="${z.id}"]`);
    g.classList.toggle('active', z.id === selected);
    g.setAttribute('aria-pressed', String(z.id === selected));
    const rect = g.querySelector('rect');
    Object.entries({ x: z.x, y: z.y, width: z.width, height: z.height }).forEach(([k, v]) => rect.setAttribute(k, v));
    const text = g.querySelector('text');
    text.setAttribute('x', z.x + 2);
    text.setAttribute('y', z.y + Math.min(z.height / 2, 4));
  });

  const { fold, punch } = getMarks(form);
  [['fold1', fold[0]], ['fold2', fold[1]], ['punch', punch]].forEach(([id, y]) => {
    const line = svg.querySelector(`[data-mark="${id}"]`);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.classList.toggle('punch', id === 'punch');
    const label = svg.querySelector(`[data-mark-label="${id}"]`);
    label.setAttribute('y', y - 1.2);
    label.textContent = String(y).replace('.', ',');
  });
}

function renderDetail(id, form) {
  const info = ZONE_INFO[id];
  const z = getZone(id, form);
  const cmp = compareForms(id);
  const other = form === 'A' ? 'B' : 'A';
  const shift = form === 'A' ? cmp.deltaY : -cmp.deltaY;

  let formNote;
  if (id === 'briefkopf') {
    formNote = `Form A: ${formatMm(getHeaderHeight('A'))} hoch · Form B: ${formatMm(getHeaderHeight('B'))} hoch. Der Unterschied von ${formatMm(cmp.deltaHeight)} verschiebt alle folgenden Zonen.`;
  } else if (shift === 0) {
    formNote = `Lage in Form A und B identisch.`;
  } else {
    formNote = `In Form ${other} liegt diese Zone ${formatMm(Math.abs(shift))} ${shift > 0 ? 'tiefer' : 'höher'} (Briefkopf ${formatMm(getHeaderHeight(other))}).`;
  }

  const measures = [
    ['Abstand oben', `${formatMm(z.y)} (${formatCm(z.y)})`],
    ['Abstand links', `${formatMm(z.x)} (${formatCm(z.x)})`],
    ['Breite', formatMm(z.width)],
    ['Höhe', `${formatMm(z.height)} ≈ ${Math.round(z.height / LINE_MM)} Zeilen`],
  ];

  return `
    <h2><span class="dot"></span>${esc(info.name)} <span class="badge">Form ${form}</span></h2>
    <p>${esc(info.summary)}</p>
    <dl class="measures">${measures.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <p class="form-note"><strong>Form A vs. B:</strong> ${esc(formNote)}</p>
    <h3>Regeln</h3>
    <ul>${info.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <h3>Typischer Fehler</h3>
    <ul class="mistakes">${info.mistakes.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`;
}
