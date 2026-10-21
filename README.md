# DIN 5008 Trainer

Mobil-optimierte Lern-App (PWA) für Auszubildende zur Vorbereitung auf den kaufmännischen Schriftverkehr nach DIN 5008 (Form A und Form B).

> Private Lern-App zu Übungszwecken (nicht-kommerziell). Die Seite ist per `noindex, nofollow` von Suchmaschinen ausgeschlossen.

## Funktionen

- **Layout-Visualizer** – A4-Briefbogen mit farbigen DIN-5008-Zonen (Briefkopf, Zusatz- und Vermerkzone, Anschriftzone, Informationsblock, Betreff, Anrede, Text, Gruß, Anlagen, Geschäftsangaben). Antippen zeigt Maße, Leerzeilen und den Unterschied zwischen Form A (27 mm) und Form B (45 mm); Falz- und Lochmarken werden mitverschoben.
- **Dokumenten-Baukasten** – Anfrage, Angebot, Zahlungserinnerung und Mahnung Schritt für Schritt aus Textbausteinen zusammenstellen, mit Erklärungen zu typischen Fehlern (Pflichtangaben, Bindefrist, konkrete Mahnfristen) und fertiger Briefvorschau.
- **Quiz** – Multiple Choice zu Layout, Schreibregeln (Datum, Uhrzeit, Zahlen, Telefonnummern, Hervorhebungen) und kaufmännischem Wissen, Auswertung nach IHK-Notenschlüssel.
- **Lernkarten** – Wiederholung im Leitner-System mit 5 Fächern; der Fortschritt wird lokal im Browser gespeichert.
- **Offline-fähig** – Service Worker cached alle Dateien beim ersten Aufruf; die App lässt sich auf dem Homescreen installieren.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Unit-Tests (Vitest)
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

Projektstruktur:

| Pfad | Inhalt |
| --- | --- |
| `src/logic/` | Reine, getestete Logik: Layout-Geometrie, Quiz/Lernkarten, Baukasten |
| `src/data/` | Lerninhalte: Zonen, Fragen, Lernkarten, Textbausteine |
| `src/views/` | Oberflächen der einzelnen Bereiche |
| `public/sw.js`, `public/manifest.json` | PWA (Service Worker und Web App Manifest) |
| `build/sw-precache.js` | Vite-Plugin, das die Build-Dateien in den Service-Worker-Cache einträgt |
| `tests/` | Unit-Tests |

## Deployment

`.github/workflows/deploy.yml` testet, baut und veröffentlicht die App bei jedem Push auf `main` auf GitHub Pages. Einmalig in den Repository-Einstellungen unter **Settings → Pages → Source** „GitHub Actions“ auswählen.

Alle Firmen, Personen und Daten in den Beispielbriefen sind frei erfunden.
