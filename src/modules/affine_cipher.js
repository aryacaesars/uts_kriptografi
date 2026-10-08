import { sanitizeText } from "./sanitizer.js";

export const AFFINE_A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
export function modInverse(a, m = 26) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(m) || m < 2) return null;
  const value = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) if ((value * x) % m === 1) return x;
  return null;
}

export function validateAffine(a, b) {
  if (!Number.isSafeInteger(a) || modInverse(a) === null) {
    throw new Error("Nilai a harus bilangan bulat relatif prima dengan 26: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25 (mod 26).");
  }
  if (!Number.isInteger(b) || b < 0 || b >= 26) throw new Error("Nilai b harus bilangan bulat dari 0 sampai 25.");
}

export function encryptAffine(plaintext, a, b) {
  validateAffine(a, b);
  const normalizedA = ((a % 26) + 26) % 26;
  return Array.from(sanitizeText(plaintext), ch => String.fromCharCode((normalizedA * (ch.charCodeAt(0) - 65) + b) % 26 + 65)).join("");
}

export function decryptAffine(ciphertext, a, b) {
  validateAffine(a, b);
  const inverse = modInverse(a);
  return Array.from(sanitizeText(ciphertext), ch => String.fromCharCode((inverse * (ch.charCodeAt(0) - 65 - b + 26)) % 26 + 65)).join("");
}
