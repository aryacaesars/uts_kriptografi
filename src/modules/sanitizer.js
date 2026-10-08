/** Kontrak Anggota 1: alfabet ASCII A-Z saja. */
export function sanitizeText(text) {
  if (typeof text !== "string") throw new TypeError("Teks harus berupa string.");
  return text.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

export function requireAlphabetKey(key) {
  const clean = sanitizeText(key);
  if (!clean) throw new Error("Kunci harus mengandung setidaknya satu huruf A-Z.");
  return clean;
}
