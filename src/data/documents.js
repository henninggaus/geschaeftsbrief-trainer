/**
 * Baukasten-Daten: Für jeden Dokumenttyp gibt es Schritte mit Textbausteinen.
 * Pro Schritt ist genau ein Baustein `correct`; die übrigen zeigen typische Fehler.
 * Alle Firmen und Personen sind frei erfunden.
 */

export const SENDER = {
  company: 'Bürotechnik Weber GmbH',
  returnLine: 'Bürotechnik Weber GmbH · Ringstraße 4 · 34117 Kassel',
  signer: 'Lena Weber',
  footer: [
    'Bürotechnik Weber GmbH · Sitz: Kassel · Amtsgericht Kassel HRB 12345',
    'Geschäftsführer: Lena Weber, Tom Berger · IBAN DE12 5205 0353 0000 1234 56',
  ],
};

const BASE_STEPS = {
  anrede: {
    id: 'anrede',
    title: 'Anrede',
    hint: 'Ist ein Ansprechpartner bekannt, wird er persönlich angesprochen.',
    options: [
      { id: 'a1', text: 'Sehr geehrte Frau Krause,', correct: true, feedback: 'Richtig: persönliche Anrede mit Komma, der Text beginnt danach klein.' },
      { id: 'a2', text: 'Sehr geehrte Frau Krause!', correct: false, feedback: 'Das Ausrufezeichen ist veraltet – DIN 5008 verwendet ein Komma.' },
      { id: 'a3', text: 'Hallo Frau Krause,', correct: false, feedback: '„Hallo“ ist für einen Geschäftsbrief an Geschäftspartner zu umgangssprachlich.' },
    ],
  },
  gruss: {
    id: 'gruss',
    title: 'Grußformel',
    hint: 'Eine Leerzeile nach dem Text, ohne Satzzeichen.',
    options: [
      { id: 'g1', text: 'Mit freundlichen Grüßen', correct: true, feedback: 'Richtig: Standard-Grußformel ohne Komma.' },
      { id: 'g2', text: 'Mit freundlichen Grüßen,', correct: false, feedback: 'Nach der Grußformel steht kein Komma.' },
      { id: 'g3', text: 'MfG', correct: false, feedback: 'Abkürzungen wirken in der Grußformel unhöflich.' },
    ],
  },
};

export const DOCUMENT_TYPES = [
  {
    id: 'anfrage',
    date: '05.10.2026',
    name: 'Anfrage',
    icon: '❓',
    description: 'Unverbindliche Bitte um ein Angebot oder um Informationen.',
    recipient: ['Papierwelt Krause KG', 'Frau Anna Krause', 'Hafenstraße 12', '28217 Bremen'],
    steps: [
      {
        id: 'betreff',
        title: 'Betreff',
        hint: 'Kurz, aussagekräftig, ohne Leitwort und ohne Punkt.',
        options: [
          { id: 'b1', text: 'Anfrage nach Kopierpapier DIN A4', correct: true, feedback: 'Richtig: knapp und präzise, ohne „Betreff:“.' },
          { id: 'b2', text: 'Betreff: Anfrage.', correct: false, feedback: 'Das Leitwort „Betreff“ entfällt seit Langem, ebenso der Schlusspunkt.' },
          { id: 'b3', text: 'Wir hätten da mal eine Frage', correct: false, feedback: 'Zu unpräzise – der Betreff soll den Inhalt auf einen Blick erkennen lassen.' },
        ],
      },
      BASE_STEPS.anrede,
      {
        id: 'einleitung',
        title: 'Einleitung',
        hint: 'Erklären Sie, wie Sie auf den Lieferer aufmerksam geworden sind.',
        options: [
          { id: 'e1', text: 'auf der Fachmesse „Paperworld“ haben wir Ihren Stand besucht und interessieren uns für Ihr Sortiment an Büropapier.', correct: true, feedback: 'Gut: konkreter Anlass, klein begonnen nach der Anrede.' },
          { id: 'e2', text: 'Wir bestellen hiermit verbindlich 200 Kartons Papier.', correct: false, feedback: 'Das wäre eine Bestellung – eine Anfrage ist unverbindlich.' },
          { id: 'e3', text: 'Ihr Angebot ist sicher zu teuer, aber wir fragen trotzdem.', correct: false, feedback: 'Negative Unterstellungen schaden der Geschäftsbeziehung.' },
        ],
      },
      {
        id: 'hauptteil',
        title: 'Hauptteil',
        hint: 'Bestimmte Anfrage: Ware, Menge und gewünschte Konditionen nennen.',
        options: [
          { id: 'h1', text: 'Bitte senden Sie uns ein Angebot über 200 Kartons Kopierpapier DIN A4, 80 g/m², mit Angaben zu Preis, Rabatten, Lieferzeit und Zahlungsbedingungen.', correct: true, feedback: 'Richtig: bestimmte Anfrage mit allen relevanten Punkten.' },
          { id: 'h2', text: 'Schicken Sie uns einfach irgendwas.', correct: false, feedback: 'Ohne Ware und Menge kann der Lieferer kein passendes Angebot erstellen.' },
          { id: 'h3', text: 'Bitte liefern Sie bis Freitag, die Rechnung zahlen wir später.', correct: false, feedback: 'Eine Lieferaufforderung ist keine Anfrage und wäre bereits eine Bestellung.' },
        ],
      },
      {
        id: 'schluss',
        title: 'Schlusssatz',
        hint: 'Freundlicher Ausblick ohne Druck.',
        options: [
          { id: 's1', text: 'Wir freuen uns auf Ihr Angebot.', correct: true, feedback: 'Richtig: freundlich und zukunftsgerichtet.' },
          { id: 's2', text: 'Antworten Sie gefälligst schnell.', correct: false, feedback: 'Unhöflich – der Ton entscheidet über die Geschäftsbeziehung.' },
          { id: 's3', text: 'In Erwartung Ihrer geschätzten Antwort verbleiben wir hochachtungsvoll', correct: false, feedback: 'Veraltete Floskel – moderne Geschäftsbriefe sind klar und direkt.' },
        ],
      },
      BASE_STEPS.gruss,
    ],
  },
  {
    id: 'angebot',
    date: '14.10.2026',
    name: 'Angebot',
    icon: '📄',
    description: 'Verbindliche Willenserklärung mit Preisen und Konditionen.',
    recipient: ['Papierwelt Krause KG', 'Frau Anna Krause', 'Hafenstraße 12', '28217 Bremen'],
    steps: [
      {
        id: 'betreff',
        title: 'Betreff',
        hint: 'Bezug zur Anfrage herstellen.',
        options: [
          { id: 'b1', text: 'Angebot über Kopierpapier DIN A4', correct: true, feedback: 'Richtig: klarer Bezug ohne Leitwort und Punkt.' },
          { id: 'b2', text: 'Betr.: Ihre Anfrage vom 12.10.2026.', correct: false, feedback: '„Betr.:“ und der Schlusspunkt entsprechen nicht der DIN 5008.' },
          { id: 'b3', text: 'ANGEBOT!!!', correct: false, feedback: 'Großbuchstaben und Ausrufezeichen wirken aufdringlich und sagen nichts über den Inhalt.' },
        ],
      },
      BASE_STEPS.anrede,
      {
        id: 'einleitung',
        title: 'Einleitung',
        hint: 'Für die Anfrage danken.',
        options: [
          { id: 'e1', text: 'vielen Dank für Ihre Anfrage vom 12. Oktober 2026. Gern bieten wir Ihnen an:', correct: true, feedback: 'Richtig: Dank und Bezug auf die Anfrage mit korrektem Datum.' },
          { id: 'e2', text: 'Endlich melden Sie sich!', correct: false, feedback: 'Vorwurfsvoller Einstieg – unprofessionell.' },
          { id: 'e3', text: 'bezugnehmend auf Ihr Schreiben vom 12/10/26 erlauben wir uns, Ihnen anzubieten:', correct: false, feedback: 'Das Datumsformat 12/10/26 ist nicht DIN-gerecht, die Formulierung ist umständlich.' },
        ],
      },
      {
        id: 'konditionen',
        title: 'Preis & Konditionen',
        hint: 'Ware, Menge, Preis, Lieferung und Zahlung vollständig angeben.',
        options: [
          { id: 'k1', text: '200 Kartons Kopierpapier DIN A4, 80 g/m², je 24,90 EUR zzgl. USt. Ab 100 Kartons gewähren wir 5 % Rabatt. Lieferung frei Haus innerhalb von 5 Werktagen. Zahlung innerhalb von 30 Tagen netto oder innerhalb von 10 Tagen mit 2 % Skonto.', correct: true, feedback: 'Vollständig: Ware, Menge, Preis, Rabatt, Liefer- und Zahlungsbedingungen.' },
          { id: 'k2', text: 'Das Papier kostet ungefähr 25 Euro.', correct: false, feedback: 'Unvollständig: Menge, Steuer, Lieferung und Zahlung fehlen – „ungefähr“ ist kein Preis.' },
          { id: 'k3', text: 'Preise auf Anfrage.', correct: false, feedback: 'Ein Angebot ohne Preis beantwortet die Anfrage nicht.' },
        ],
      },
      {
        id: 'bindung',
        title: 'Bindung',
        hint: 'Angebote sind bindend (§ 145 BGB) – eine Frist schafft Klarheit.',
        options: [
          { id: 'f1', text: 'An dieses Angebot halten wir uns bis zum 15. November 2026 gebunden.', correct: true, feedback: 'Richtig: klare Bindefrist mit Datum.' },
          { id: 'f2', text: 'Dieses Angebot ist vielleicht gültig.', correct: false, feedback: 'Unklare Formulierung – rechtlich riskant und unprofessionell.' },
          { id: 'f3', text: 'Wir bieten verbindlich an, behalten uns aber jederzeitige Preisänderungen vor.', correct: false, feedback: 'Widersprüchlich: „verbindlich“ und ein Änderungsvorbehalt schließen sich aus.' },
        ],
      },
      BASE_STEPS.gruss,
    ],
  },
  {
    id: 'zahlungserinnerung',
    date: '21.10.2026',
    name: 'Zahlungserinnerung',
    icon: '🔔',
    description: 'Freundlicher Hinweis auf eine offene Rechnung – meist ein Versehen.',
    recipient: ['Papierwelt Krause KG', 'Buchhaltung', 'Hafenstraße 12', '28217 Bremen'],
    steps: [
      {
        id: 'betreff',
        title: 'Betreff',
        hint: 'Freundlich und eindeutig mit Rechnungsnummer.',
        options: [
          { id: 'b1', text: 'Zahlungserinnerung zu Rechnung Nr. 2026-0815', correct: true, feedback: 'Richtig: eindeutige Zuordnung über die Rechnungsnummer.' },
          { id: 'b2', text: 'Letzte Warnung!', correct: false, feedback: 'Viel zu scharf für die erste Erinnerung – das gefährdet die Kundenbeziehung.' },
          { id: 'b3', text: 'Betreff: Geld', correct: false, feedback: 'Leitwort „Betreff“ entfällt; der Inhalt ist zu unpräzise.' },
        ],
      },
      { ...BASE_STEPS.anrede, options: [
        { id: 'a1', text: 'Sehr geehrte Damen und Herren,', correct: true, feedback: 'Richtig: Ohne bekannten Ansprechpartner in der Buchhaltung ist die allgemeine Anrede korrekt.' },
        { id: 'a2', text: 'Liebe säumige Kunden,', correct: false, feedback: 'Vorwurfsvolle Anrede – unhöflich.' },
        { id: 'a3', text: 'Sehr geehrte Damen und Herren!', correct: false, feedback: 'Statt Ausrufezeichen steht nach der Anrede ein Komma.' },
      ] },
      {
        id: 'sachverhalt',
        title: 'Sachverhalt',
        hint: 'Offene Rechnung sachlich benennen: Nummer, Datum, Betrag.',
        options: [
          { id: 'v1', text: 'sicher ist es Ihrer Aufmerksamkeit entgangen, dass unsere Rechnung Nr. 2026-0815 vom 15. September 2026 über 1.428,00 EUR noch offen ist.', correct: true, feedback: 'Richtig: freundlich, unterstellt ein Versehen und nennt alle Daten.' },
          { id: 'v2', text: 'Sie haben schon wieder nicht bezahlt.', correct: false, feedback: 'Vorwurfsvoll und ohne Rechnungsdaten.' },
          { id: 'v3', text: 'eine Rechnung ist offen, Betrag ca. 1400 Euro.', correct: false, feedback: 'Ohne Rechnungsnummer und genauen Betrag kann die Buchhaltung den Vorgang nicht zuordnen.' },
        ],
      },
      {
        id: 'bitte',
        title: 'Zahlungsbitte',
        hint: 'Höfliche Bitte mit konkretem Termin.',
        options: [
          { id: 'z1', text: 'Bitte überweisen Sie den Betrag bis zum 4. November 2026. Eine Kopie der Rechnung liegt bei.', correct: true, feedback: 'Richtig: konkretes Datum und Rechnungskopie erleichtern die Zahlung.' },
          { id: 'z2', text: 'Zahlen Sie sofort, sonst schalten wir den Anwalt ein.', correct: false, feedback: 'Drohungen gehören allenfalls in die letzte Mahnung, nicht in die Erinnerung.' },
          { id: 'z3', text: 'Zahlen Sie, wann es Ihnen passt.', correct: false, feedback: 'Ohne Termin bleibt die Erinnerung wirkungslos.' },
        ],
      },
      {
        id: 'schluss',
        title: 'Schlusssatz',
        hint: 'Überschneidung von Zahlung und Schreiben berücksichtigen.',
        options: [
          { id: 's1', text: 'Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.', correct: true, feedback: 'Richtig: Standardsatz, der Missverständnisse vermeidet.' },
          { id: 's2', text: 'Wir sind sehr enttäuscht von Ihnen.', correct: false, feedback: 'Emotional und unsachlich.' },
          { id: 's3', text: 'Weitere Lieferungen erfolgen ab sofort nicht mehr.', correct: false, feedback: 'Ein Lieferstopp ist bei einer ersten Erinnerung unverhältnismäßig.' },
        ],
      },
      BASE_STEPS.gruss,
    ],
  },
  {
    id: 'mahnung',
    date: '06.11.2026',
    name: 'Mahnung',
    icon: '⚠️',
    description: 'Bestimmte Zahlungsaufforderung mit Frist und Hinweis auf Folgen.',
    notice: 'Einschreiben',
    recipient: ['Papierwelt Krause KG', 'Buchhaltung', 'Hafenstraße 12', '28217 Bremen'],
    steps: [
      {
        id: 'betreff',
        title: 'Betreff',
        hint: 'Mahnstufe und Rechnungsnummer nennen.',
        options: [
          { id: 'b1', text: '2. Mahnung zu Rechnung Nr. 2026-0815', correct: true, feedback: 'Richtig: Mahnstufe und Rechnung sind sofort erkennbar.' },
          { id: 'b2', text: 'Mahnung.', correct: false, feedback: 'Ohne Rechnungsnummer nicht zuzuordnen; kein Schlusspunkt im Betreff.' },
          { id: 'b3', text: 'Unverschämtheit!', correct: false, feedback: 'Emotional und ohne Inhalt.' },
        ],
      },
      { ...BASE_STEPS.anrede, options: [
        { id: 'a1', text: 'Sehr geehrte Damen und Herren,', correct: true, feedback: 'Richtig: sachliche, allgemeine Anrede.' },
        { id: 'a2', text: 'Hallo,', correct: false, feedback: 'Zu salopp für eine Mahnung.' },
        { id: 'a3', text: 'An die säumigen Zahler,', correct: false, feedback: 'Beleidigende Formulierungen sind unprofessionell und können rechtlich problematisch sein.' },
      ] },
      {
        id: 'sachverhalt',
        title: 'Sachverhalt',
        hint: 'Bisherigen Verlauf sachlich zusammenfassen.',
        options: [
          { id: 'v1', text: 'trotz unserer Zahlungserinnerung vom 21. Oktober 2026 ist der Rechnungsbetrag von 1.428,00 EUR (Rechnung Nr. 2026-0815 vom 15. September 2026) noch nicht bei uns eingegangen.', correct: true, feedback: 'Richtig: Verlauf, Betrag, Rechnungsnummer und Datum sind dokumentiert.' },
          { id: 'v2', text: 'Sie schulden uns immer noch Geld, wie immer.', correct: false, feedback: 'Pauschal und ohne Fakten – für ein späteres Mahnverfahren unbrauchbar.' },
          { id: 'v3', text: 'die Rechnung vom 15.9.26 ist offen.', correct: false, feedback: 'Betrag und Rechnungsnummer fehlen, das Datum ist nicht DIN-gerecht (15.09.2026).' },
        ],
      },
      {
        id: 'frist',
        title: 'Fristsetzung',
        hint: 'Angemessene Frist (ca. 10–14 Tage) mit Kalenderdatum.',
        options: [
          { id: 'f1', text: 'Bitte überweisen Sie den Betrag zuzüglich 5,00 EUR Mahngebühren bis spätestens 20. November 2026 auf das unten genannte Konto.', correct: true, feedback: 'Richtig: konkretes Datum, angemessene Frist, Gebühren transparent.' },
          { id: 'f2', text: 'Zahlen Sie umgehend.', correct: false, feedback: '„Umgehend“ ist unbestimmt – im Streitfall lässt sich kein Fristablauf nachweisen.' },
          { id: 'f3', text: 'Zahlen Sie innerhalb von 24 Stunden.', correct: false, feedback: 'Unangemessen kurze Frist; sie ist praktisch kaum einzuhalten.' },
        ],
      },
      {
        id: 'folgen',
        title: 'Folgen ankündigen',
        hint: 'Rechtliche Schritte sachlich ankündigen.',
        options: [
          { id: 'r1', text: 'Sollte die Zahlung nicht fristgerecht eingehen, werden wir ohne weitere Ankündigung das gerichtliche Mahnverfahren einleiten.', correct: true, feedback: 'Richtig: sachliche, rechtlich zulässige Ankündigung der nächsten Stufe.' },
          { id: 'r2', text: 'Sonst erzählen wir allen Ihren Kunden, dass Sie nicht zahlen.', correct: false, feedback: 'Rufschädigende Drohungen sind unzulässig und können strafbar sein.' },
          { id: 'r3', text: 'Ansonsten passiert eben nichts.', correct: false, feedback: 'Ohne angekündigte Konsequenz verliert die Mahnung ihre Wirkung.' },
        ],
      },
      BASE_STEPS.gruss,
    ],
  },
];

/** Stichworte zur Rechtslage, die im Baukasten angezeigt werden. */
export const LEGAL_NOTES = {
  anfrage: 'Eine Anfrage ist rechtlich unverbindlich – sie verpflichtet weder zum Kauf noch zur Abnahme.',
  angebot: 'Angebote sind nach § 145 BGB bindend, es sei denn, sie enthalten Freizeichnungsklauseln wie „freibleibend“.',
  zahlungserinnerung: 'Die Zahlungserinnerung ist rechtlich bereits eine Mahnung, wird aber bewusst freundlich formuliert.',
  mahnung: 'Mit Zugang der Mahnung nach Fälligkeit tritt Verzug ein (§ 286 BGB). Verzugszinsen: 5 bzw. 9 Prozentpunkte über dem Basiszinssatz (§ 288 BGB).',
};
