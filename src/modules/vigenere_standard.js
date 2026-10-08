import { sanitizeText, requireAlphabetKey } from "./sanitizer.js";

function transform(text, key, direction) {
  const clean = sanitizeText(text);
  const seed = requireAlphabetKey(key);
  return Array.from(clean, (letter, i) => String.fromCharCode(
    (letter.charCodeAt(0) - 65 + direction * (seed.charCodeAt(i % seed.length) - 65) + 26) % 26 + 65
  )).join("");
}

export function encryptVigenereStandard(plaintext, key) { return transform(plaintext, key, 1); }
export function decryptVigenereStandard(ciphertext, key) { return transform(ciphertext, key, -1); }
