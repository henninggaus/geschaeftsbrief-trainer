/**
 * Geometrie eines Geschäftsbriefs nach DIN 5008 (alle Werte in Millimetern,
 * Ursprung oben links auf einem A4-Blatt im Hochformat).
 */

export const PAGE = Object.freeze({ width: 210, height: 297 });

/** Eine Zeile bei 12 pt / 6 Zeilen pro Zoll. */
export const LINE_MM = 4.23;

export const MARGINS = Object.freeze({ left: 25, right: 20 });

export const FORMS = Object.freeze(['A', 'B']);

const HEADER_HEIGHT = { A: 27, B: 45 };
const FOLD_MARKS = { A: [87, 192], B: [105, 210] };
const PUNCH_MARK = 148.5;

/** Anschriftfeld: 85 × 45 mm, 20 mm vom linken Blattrand. */
export const ADDRESS_FIELD = Object.freeze({
  x: 20,
  width: 85,
  height: 45,
  additionZone: 17.7, // 5 mm Freiraum + 3 Zeilen Zusatz- und Vermerkzone
  addressZone: 27.3, // 6 Zeilen Anschriftzone
});

/** Informationsblock: ab 125 mm vom linken Rand, 75 mm breit. */
export const INFO_BLOCK = Object.freeze({ x: 125, width: 75, offsetTop: 5 });

const TEXT_WIDTH = PAGE.width - MARGINS.left - MARGINS.right;
const TEXT_AREA_HEIGHT = 18 * LINE_MM;
const FOOTER_HEIGHT = 16;

export function assertForm(form) {
  if (!FORMS.includes(form)) {
    throw new Error(`Unbekannte Form "${form}" – erlaubt sind "A" oder "B".`);
  }
}

export function blankLinesToMm(lines) {
  if (!Number.isFinite(lines) || lines < 0) throw new Error('Ungültige Zeilenanzahl');
  return round(lines * LINE_MM);
}

export function getHeaderHeight(form) {
  assertForm(form);
  return HEADER_HEIGHT[form];
}

export function getMarks(form) {
  assertForm(form);
  return { fold: [...FOLD_MARKS[form]], punch: PUNCH_MARK };
}

/**
 * Berechnet alle Zonen für Form A oder B.
 * Abstände zwischen Betreff, Anrede, Text, Gruß und Anlagen folgen den
 * Leerzeilen-Regeln der DIN 5008.
 */
export function getZones(form) {
  const header = getHeaderHeight(form);
  const fieldTop = header;
  const addressTop = fieldTop + ADDRESS_FIELD.additionZone;
  const fieldBottom = fieldTop + ADDRESS_FIELD.height;

  const zones = [];
  const add = (id, x, y, width, height) =>
    zones.push({ id, x: round(x), y: round(y), width: round(width), height: round(height) });

  add('briefkopf', 0, 0, PAGE.width, header);
  add('zusatzzone', ADDRESS_FIELD.x, fieldTop, ADDRESS_FIELD.width, ADDRESS_FIELD.additionZone);
  add('anschriftzone', ADDRESS_FIELD.x, addressTop, ADDRESS_FIELD.width, ADDRESS_FIELD.addressZone);
  add('infoblock', INFO_BLOCK.x, fieldTop + INFO_BLOCK.offsetTop, INFO_BLOCK.width, ADDRESS_FIELD.height - INFO_BLOCK.offsetTop);

  // Betreff: zwei Leerzeilen unter dem Anschriftfeld
  let y = fieldBottom + 2 * LINE_MM;
  add('betreff', MARGINS.left, y, TEXT_WIDTH, LINE_MM);
  // Anrede: zwei Leerzeilen nach dem Betreff
  y += LINE_MM + 2 * LINE_MM;
  add('anrede', MARGINS.left, y, TEXT_WIDTH, LINE_MM);
  // Text: eine Leerzeile nach der Anrede
  y += LINE_MM + LINE_MM;
  add('textbereich', MARGINS.left, y, TEXT_WIDTH, TEXT_AREA_HEIGHT);
  // Gruß: eine Leerzeile nach dem Text, danach Firma + 3 Leerzeilen für die Unterschrift + Name
  y += TEXT_AREA_HEIGHT + LINE_MM;
  const greetingHeight = 6 * LINE_MM;
  add('grussformel', MARGINS.left, y, TEXT_WIDTH, greetingHeight);
  // Anlagen: eine Leerzeile nach dem Gruß-/Namensblock
  y += greetingHeight + LINE_MM;
  add('anlagen', MARGINS.left, y, TEXT_WIDTH, 2 * LINE_MM);

  add('fusszeile', MARGINS.left, PAGE.height - FOOTER_HEIGHT - 4, TEXT_WIDTH, FOOTER_HEIGHT);

  return zones;
}

export function getZone(id, form) {
  const zone = getZones(form).find((z) => z.id === id);
  if (!zone) throw new Error(`Unbekannte Zone "${id}"`);
  return zone;
}

/** Liefert die Zone an einer Position (mm). Kleine Zonen gewinnen bei Überlappung. */
export function zoneAt(x, y, form) {
  const hits = getZones(form).filter(
    (z) => x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height,
  );
  if (!hits.length) return null;
  return hits.reduce((a, b) => (a.width * a.height <= b.width * b.height ? a : b));
}

/** Prozentwerte relativ zum A4-Blatt, z. B. für CSS-Positionierung. */
export function toPercent(zone) {
  return {
    left: round((zone.x / PAGE.width) * 100),
    top: round((zone.y / PAGE.height) * 100),
    width: round((zone.width / PAGE.width) * 100),
    height: round((zone.height / PAGE.height) * 100),
  };
}

/** Vergleicht die Lage einer Zone in Form A und Form B. */
export function compareForms(id) {
  const a = getZone(id, 'A');
  const b = getZone(id, 'B');
  return { a, b, deltaY: round(b.y - a.y), deltaHeight: round(b.height - a.height) };
}

/** Schreibt Millimeter deutsch formatiert, z. B. 4,23 mm bzw. 2,5 cm. */
export function formatMm(mm) {
  return `${formatNumber(mm)} mm`;
}

export function formatCm(mm) {
  return `${formatNumber(mm / 10)} cm`;
}

function formatNumber(n) {
  return String(round(n)).replace('.', ',');
}

function round(n) {
  return Math.round(n * 100) / 100;
}
