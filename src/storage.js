/** localStorage-Zugriff, der in privaten Fenstern o. Ä. nicht abstürzt. */
const PREFIX = 'din5008-trainer:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Speicher nicht verfügbar – Fortschritt gilt dann nur für diese Sitzung.
  }
}
