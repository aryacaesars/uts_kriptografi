import { sanitizeText, requireAlphabetKey } from "./sanitizer.js";

export function encryptAutoKeyVigenere(plaintext, key) {
  const plain = sanitizeText(plaintext);
  const stream = requireAlphabetKey(key) + plain;
  return Array.from(plain, (letter, i) => String.fromCharCode(
    (letter.charCodeAt(0) + stream.charCodeAt(i) - 130) % 26 + 65
  )).join("");
}

export function decryptAutoKeyVigenere(ciphertext, key) {
  const cipher = sanitizeText(ciphertext);
  const seed = requireAlphabetKey(key);
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const k = i < seed.length ? seed[i] : plain[i - seed.length];
    plain.push(String.fromCharCode((cipher.charCodeAt(i) - k.charCodeAt(0) + 26) % 26 + 65));
  }
  return plain.join("");
}
