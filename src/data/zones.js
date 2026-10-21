/**
 * Erklärungen zu den DIN-5008-Zonen. Die Geometrie stammt aus logic/layout.js,
 * hier stehen nur Bezeichnungen, Farben und Lerntexte.
 */
export const ZONE_INFO = {
  briefkopf: {
    name: 'Briefkopf',
    color: '#4f46e5',
    summary: 'Logo, Firmenname und ggf. Kommunikationsangaben des Absenders.',
    rules: [
      'Reicht über die volle Blattbreite vom oberen Blattrand bis zum Anschriftfeld.',
      'Form A: 27 mm hoch – mehr Platz für den Brieftext.',
      'Form B: 45 mm hoch – mehr Raum für Logo und Gestaltung (häufigste Form in der Praxis).',
    ],
    mistakes: ['Briefkopf ragt in das Anschriftfeld hinein – bei Fensterumschlägen ist dann der Empfänger verdeckt.'],
  },
  zusatzzone: {
    name: 'Zusatz- und Vermerkzone',
    color: '#0891b2',
    summary: 'Oberer Teil des Anschriftfelds für Rücksendeangabe und Vermerke.',
    rules: [
      '17,7 mm hoch: 5 mm Freiraum plus 3 Zeilen.',
      'Rücksendeangabe (kleine Absenderzeile) steht hier, z. B. „Weber GmbH · Ringstr. 4 · 12345 Musterstadt“.',
      'Vermerke wie „Einschreiben“, „Persönlich“ oder „Vertraulich“ – von unten nach oben auffüllen, direkt über der Anschrift.',
    ],
    mistakes: ['„Persönlich“ in die Anschriftzone schreiben statt in die Vermerkzone.'],
  },
  anschriftzone: {
    name: 'Anschriftzone',
    color: '#059669',
    summary: 'Bis zu 6 Zeilen für die Empfängeranschrift – im Fenster des Umschlags sichtbar.',
    rules: [
      '27,3 mm hoch, 6 Zeilen; Anschriftfeld gesamt 85 × 45 mm.',
      'Beginnt 20 mm vom linken Blattrand (Schrift beginnt bei 25 mm).',
      'Keine Leerzeilen innerhalb der Anschrift; Ort nicht unterstreichen oder sperren.',
      'Bei Auslandsanschriften steht das Bestimmungsland in Großbuchstaben in der letzten Zeile.',
    ],
    mistakes: ['Leerzeile zwischen Straße und Ort.', '„Herrn“ und Name in derselben Zeile wie die Firma.'],
  },
  infoblock: {
    name: 'Informationsblock',
    color: '#d97706',
    summary: 'Rechts neben dem Anschriftfeld: Zeichen, Ansprechpartner, Telefon, E-Mail und Datum.',
    rules: [
      'Beginnt 125 mm vom linken Blattrand, 75 mm breit (rechter Rand mind. 10 mm).',
      'Oberkante: Form A 32 mm, Form B 50 mm vom oberen Blattrand.',
      'Leitwörter wie „Ihr Zeichen:“, „Unser Zeichen:“, „Datum:“ stehen untereinander.',
      'Alternative: Bezugszeichenzeile in einer Zeile unter dem Anschriftfeld.',
    ],
    mistakes: ['Datum zusätzlich rechtsbündig über dem Betreff wiederholen.'],
  },
  betreff: {
    name: 'Betreff',
    color: '#dc2626',
    summary: 'Kurze, aussagekräftige Inhaltsangabe des Briefs.',
    rules: [
      'Zwei Leerzeilen unter dem Anschriftfeld bzw. Informationsblock.',
      'Ohne das Wort „Betreff“ oder „Betr.“; ohne Schlusspunkt.',
      'Darf fett oder farbig hervorgehoben werden.',
      'Nach dem Betreff folgen zwei Leerzeilen bis zur Anrede.',
    ],
    mistakes: ['„Betreff: Ihre Anfrage.“ – Leitwort und Punkt sind falsch.'],
  },
  anrede: {
    name: 'Anrede',
    color: '#be185d',
    summary: 'Persönliche Anrede, möglichst mit Namen.',
    rules: [
      'Zwei Leerzeilen nach dem Betreff.',
      'Endet mit Komma, der Brieftext beginnt dann klein (außer bei Substantiven oder „Sie“).',
      'Eine Leerzeile zwischen Anrede und Brieftext.',
    ],
    mistakes: ['„Sehr geehrte Damen und Herren!“ mit Ausrufezeichen und großem Textanfang.'],
  },
  textbereich: {
    name: 'Textbereich',
    color: '#7c3aed',
    summary: 'Der eigentliche Brieftext in Absätzen.',
    rules: [
      'Linker Rand 25 mm (2,5 cm), rechter Rand mindestens 20 mm (2 cm).',
      'Absätze durch genau eine Leerzeile trennen; Fließtext linksbündig.',
      'Hervorhebungen (fett, kursiv, unterstrichen, farbig) sparsam einsetzen.',
      'Folgeseiten mit Seitenzahl kennzeichnen, z. B. „Seite 2 von 3“.',
    ],
    mistakes: ['Absätze durch Einrückung statt Leerzeile kennzeichnen.'],
  },
  grussformel: {
    name: 'Grußformel & Unterschrift',
    color: '#0d9488',
    summary: 'Gruß, ggf. Firmenname, Raum für die Unterschrift und Name in Maschinenschrift.',
    rules: [
      'Eine Leerzeile nach dem Brieftext.',
      'Firmenname optional eine Leerzeile unter dem Gruß.',
      'Drei Leerzeilen Platz für die handschriftliche Unterschrift.',
      'Zusätze wie „i. A.“ oder „ppa.“ stehen vor dem Namen.',
    ],
    mistakes: ['„Mit freundlichen Grüßen,“ – nach der Grußformel steht kein Komma.'],
  },
  anlagen: {
    name: 'Anlagen- und Verteilvermerk',
    color: '#65a30d',
    summary: 'Hinweis auf beigefügte Unterlagen und weitere Empfänger.',
    rules: [
      'Eine Leerzeile unter dem Namen bzw. der Grußformel.',
      'Leitwort „Anlage“ oder „Anlagen“ – fett hervorheben ist erlaubt.',
      'Anlagen untereinander aufführen; „Verteiler“ folgt nach einer Leerzeile.',
      'Bei Platzmangel neben der Grußformel ab 125 mm.',
    ],
    mistakes: ['„Anlagen: 2“ ohne die Unterlagen zu benennen.'],
  },
  fusszeile: {
    name: 'Geschäftsangaben (Fußzeile)',
    color: '#64748b',
    summary: 'Gesetzliche Pflichtangaben, Bankverbindung und Kontaktdaten.',
    rules: [
      'Pflichtangaben nach § 37a HGB / § 35a GmbHG: Firma mit Rechtsform, Sitz, Registergericht und Registernummer.',
      'Bei einer GmbH zusätzlich alle Geschäftsführer (ggf. Aufsichtsratsvorsitz).',
      'Üblich: Bankverbindung mit IBAN/BIC, USt-IdNr.',
    ],
    mistakes: ['Registergericht oder Handelsregisternummer fehlen – das kann ein Zwangsgeld nach sich ziehen.'],
  },
};

export const ZONE_ORDER = Object.keys(ZONE_INFO);
