const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** Zeilenumbrüche aus Daten als <br> ausgeben. */
export function escLines(value) {
  return esc(value).replace(/\n/g, '<br>');
}
