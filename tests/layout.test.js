import { describe, it, expect } from 'vitest';
import {
  PAGE, LINE_MM, MARGINS, FORMS, getZones, getZone, getHeaderHeight, getMarks, zoneAt, toPercent,
  compareForms, blankLinesToMm, formatMm, formatCm,
} from '../src/logic/layout.js';
import { ZONE_INFO } from '../src/data/zones.js';

describe('Briefkopf und Marken', () => {
  it('Form A hat einen 27 mm, Form B einen 45 mm hohen Briefkopf', () => {
    expect(getHeaderHeight('A')).toBe(27);
    expect(getHeaderHeight('B')).toBe(45);
    expect(getZone('briefkopf', 'A')).toMatchObject({ x: 0, y: 0, width: 210, height: 27 });
    expect(getZone('briefkopf', 'B').height).toBe(45);
  });

  it('liefert Falz- und Lochmarken je Form', () => {
    expect(getMarks('A')).toEqual({ fold: [87, 192], punch: 148.5 });
    expect(getMarks('B')).toEqual({ fold: [105, 210], punch: 148.5 });
  });

  it('lehnt unbekannte Formen ab', () => {
    expect(() => getZones('C')).toThrow(/Unbekannte Form/);
    expect(() => getHeaderHeight()).toThrow();
  });
});

describe('Anschriftfeld und Informationsblock', () => {
  it.each(FORMS)('Anschriftfeld in Form %s ist 85 × 45 mm und beginnt 20 mm links', (form) => {
    const zusatz = getZone('zusatzzone', form);
    const anschrift = getZone('anschriftzone', form);
    expect(zusatz.x).toBe(20);
    expect(zusatz.y).toBe(getHeaderHeight(form));
    expect(zusatz.width).toBe(85);
    expect(zusatz.height + anschrift.height).toBeCloseTo(45, 5);
    expect(anschrift.y).toBeCloseTo(zusatz.y + zusatz.height, 5);
  });

  it('Zusatz- und Vermerkzone 17,7 mm, Anschriftzone 27,3 mm (≈ 6 Zeilen)', () => {
    expect(getZone('zusatzzone', 'A').height).toBe(17.7);
    expect(getZone('anschriftzone', 'A').height).toBe(27.3);
    expect(Math.round(27.3 / LINE_MM)).toBe(6);
  });

  it('Informationsblock beginnt bei 125 mm, ist 75 mm breit und startet bei 32 bzw. 50 mm', () => {
    expect(getZone('infoblock', 'A')).toMatchObject({ x: 125, width: 75, y: 32 });
    expect(getZone('infoblock', 'B').y).toBe(50);
  });

  it('Anschriftfeld und Informationsblock überlappen nicht', () => {
    for (const form of FORMS) {
      const a = getZone('anschriftzone', form);
      expect(a.x + a.width).toBeLessThan(getZone('infoblock', form).x);
    }
  });
});

describe('Abstände im Textteil', () => {
  it.each(FORMS)('Form %s: 2 Leerzeilen vor Betreff und Anrede, 1 vor Text und Gruß', (form) => {
    const z = Object.fromEntries(getZones(form).map((zone) => [zone.id, zone]));
    const fieldBottom = z.anschriftzone.y + z.anschriftzone.height;
    const gap = (upper, lowerY) => (lowerY - (upper.y + upper.height)) / LINE_MM;
    expect((z.betreff.y - fieldBottom) / LINE_MM).toBeCloseTo(2, 1);
    expect(gap(z.betreff, z.anrede.y)).toBeCloseTo(2, 1);
    expect(gap(z.anrede, z.textbereich.y)).toBeCloseTo(1, 1);
    expect(gap(z.textbereich, z.grussformel.y)).toBeCloseTo(1, 1);
    expect(gap(z.grussformel, z.anlagen.y)).toBeCloseTo(1, 1);
  });

  it.each(FORMS)('Form %s: Text beginnt bei 25 mm und lässt rechts 20 mm frei', (form) => {
    const text = getZone('textbereich', form);
    expect(text.x).toBe(MARGINS.left);
    expect(text.x).toBe(25);
    expect(PAGE.width - (text.x + text.width)).toBe(20);
  });

  it.each(FORMS)('Form %s: alle Zonen liegen auf dem Blatt, die Reihenfolge stimmt', (form) => {
    const zones = getZones(form);
    for (const z of zones) {
      expect(z.x).toBeGreaterThanOrEqual(0);
      expect(z.y).toBeGreaterThanOrEqual(0);
      expect(z.x + z.width).toBeLessThanOrEqual(PAGE.width);
      expect(z.y + z.height).toBeLessThanOrEqual(PAGE.height);
    }
    const order = ['betreff', 'anrede', 'textbereich', 'grussformel', 'anlagen', 'fusszeile'];
    const ys = order.map((id) => getZone(id, form).y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });
});

describe('Hilfsfunktionen', () => {
  it('compareForms: alle Zonen unterhalb des Briefkopfs liegen in Form B 18 mm tiefer', () => {
    for (const id of ['zusatzzone', 'anschriftzone', 'infoblock', 'betreff', 'textbereich', 'anlagen']) {
      expect(compareForms(id).deltaY).toBeCloseTo(18, 5);
    }
    expect(compareForms('briefkopf')).toMatchObject({ deltaY: 0, deltaHeight: 18 });
    expect(compareForms('fusszeile').deltaY).toBe(0);
  });

  it('zoneAt findet die Zone an einer Position und bevorzugt die kleinste', () => {
    expect(zoneAt(10, 10, 'A').id).toBe('briefkopf');
    expect(zoneAt(50, 60, 'A').id).toBe('anschriftzone');
    expect(zoneAt(50, 30, 'B').id).toBe('briefkopf');
    expect(zoneAt(50, 50, 'B').id).toBe('zusatzzone');
    expect(zoneAt(150, 60, 'B').id).toBe('infoblock');
    expect(zoneAt(5, 150, 'A')).toBeNull();
  });

  it('toPercent rechnet relativ zum A4-Blatt', () => {
    expect(toPercent({ x: 0, y: 0, width: 210, height: 297 })).toEqual({ left: 0, top: 0, width: 100, height: 100 });
    expect(toPercent(getZone('briefkopf', 'B')).height).toBeCloseTo((45 / 297) * 100, 1);
  });

  it('rechnet Leerzeilen in Millimeter um', () => {
    expect(blankLinesToMm(1)).toBe(4.23);
    expect(blankLinesToMm(3)).toBe(12.69);
    expect(() => blankLinesToMm(-1)).toThrow();
  });

  it('formatiert Maße deutsch', () => {
    expect(formatMm(4.23)).toBe('4,23 mm');
    expect(formatCm(25)).toBe('2,5 cm');
  });

  it('zu jeder Zone gibt es Lerninhalte', () => {
    const ids = getZones('A').map((z) => z.id);
    expect(Object.keys(ZONE_INFO).sort()).toEqual([...ids].sort());
    for (const info of Object.values(ZONE_INFO)) {
      expect(info.name).toBeTruthy();
      expect(info.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(info.rules.length).toBeGreaterThan(0);
      expect(info.mistakes.length).toBeGreaterThan(0);
    }
  });
});
