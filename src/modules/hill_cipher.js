/**
 * Hill Cipher (26 alfabet) - ordo 2x2 dan 3x3
 * Dhiya (237006066) - UTS Kriptografi
 *
 * Kontrak fungsi:
 *   encryptHill(plaintext, matrixKey)  -> string
 *   decryptHill(ciphertext, matrixKey) -> string
 *   validateHillMatrix(matrixKey)      -> { isValid, det, detInverse, message }
 *
 * Catatan: modul ini mandiri (tidak bergantung pada modul lain) dan bisa dipakai
 * di browser (ES module) maupun Node.js.
 */

const MOD = 26;

/** Sanitasi: hanya A-Z, uppercase (sama dengan sanitizeText milik Arya). */
function sanitize(text) {
  return String(text).toUpperCase().replace(/[^A-Z]/g, "");
}

/** Modulo yang selalu non-negatif. */
function mod(n, m = MOD) {
  return ((n % m) + m) % m;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Invers perkalian x terhadap m, atau null jika gcd(x, m) != 1. */
function modInverse(x, m = MOD) {
  x = mod(x, m);
  for (let i = 1; i < m; i++) {
    if ((x * i) % m === 1) return i;
  }
  return null;
}

/** Cek bentuk matriks: persegi, ordo 2 atau 3, semua elemen integer. */
function checkShape(K) {
  if (!Array.isArray(K) || K.length === 0) return "Matriks kunci kosong.";
  const n = K.length;
  if (n !== 2 && n !== 3) return "Ordo matriks harus 2x2 atau 3x3.";
  for (const row of K) {
    if (!Array.isArray(row) || row.length !== n) {
      return "Matriks kunci harus persegi (n x n).";
    }
    for (const v of row) {
      if (!Number.isInteger(v)) return "Semua elemen matriks harus bilangan bulat.";
    }
  }
  return null;
}

/** Determinan integer (belum di-mod) untuk 2x2 / 3x3. */
function determinant(K) {
  if (K.length === 2) {
    return K[0][0] * K[1][1] - K[0][1] * K[1][0];
  }
  const [[a, b, c], [d, e, f], [g, h, i]] = K;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/**
 * Validasi invertibilitas matriks kunci modulo 26.
 * Syarat: gcd(det(K) mod 26, 26) == 1.
 */
export function validateHillMatrix(matrixKey) {
  const shapeError = checkShape(matrixKey);
  if (shapeError) {
    return { isValid: false, det: NaN, detInverse: null, message: shapeError };
  }
  const det = mod(determinant(matrixKey));
  const detInverse = modInverse(det);
  if (detInverse === null) {
    return {
      isValid: false,
      det,
      detInverse: null,
      message:
        `det(K) mod 26 = ${det}, gcd(${det}, 26) = ${gcd(det, MOD)} (harus 1). ` +
        "Matriks tidak punya invers modulo 26, pilih kunci lain.",
    };
  }
  return {
    isValid: true,
    det,
    detInverse,
    message: `Valid. det(K) mod 26 = ${det}, invers determinan = ${detInverse}.`,
  };
}

/** Matriks kofaktor-adjoin (adjugate) mod 26 untuk 2x2 / 3x3. */
function adjugate(K) {
  if (K.length === 2) {
    const [[a, b], [c, d]] = K;
    return [
      [mod(d), mod(-b)],
      [mod(-c), mod(a)],
    ];
  }
  const n = 3;
  const cof = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const rows = [0, 1, 2].filter((x) => x !== r);
      const cols = [0, 1, 2].filter((x) => x !== c);
      const minor =
        K[rows[0]][cols[0]] * K[rows[1]][cols[1]] -
        K[rows[0]][cols[1]] * K[rows[1]][cols[0]];
      cof[r][c] = ((r + c) % 2 === 0 ? 1 : -1) * minor;
    }
  }
  // adjugate = transpose dari matriks kofaktor
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => mod(cof[c][r]))
  );
}

/** Invers matriks modulo 26: K^-1 = det^-1 * adj(K) mod 26. */
export function inverseMatrix(matrixKey) {
  const v = validateHillMatrix(matrixKey);
  if (!v.isValid) throw new Error(v.message);
  const adj = adjugate(matrixKey);
  return adj.map((row) => row.map((x) => mod(v.detInverse * x)));
}

/** Kalikan matriks dengan vektor blok lalu mod 26. */
function applyMatrix(K, vec) {
  return K.map((row) => mod(row.reduce((sum, k, j) => sum + k * vec[j], 0)));
}

function transform(text, K, padIfNeeded) {
  const n = K.length;
  let s = sanitize(text);
  if (padIfNeeded) {
    while (s.length % n !== 0) s += "X";
  } else if (s.length % n !== 0) {
    throw new Error(
      `Panjang cipherteks (${s.length}) harus kelipatan ${n} untuk ordo ${n}x${n}.`
    );
  }
  let out = "";
  for (let i = 0; i < s.length; i += n) {
    const block = [];
    for (let j = 0; j < n; j++) block.push(s.charCodeAt(i + j) - 65);
    for (const v of applyMatrix(K, block)) out += String.fromCharCode(v + 65);
  }
  return out;
}

/** Enkripsi: C = K * P mod 26. Padding 'X' jika panjang bukan kelipatan ordo. */
export function encryptHill(plaintext, matrixKey) {
  const v = validateHillMatrix(matrixKey);
  if (!v.isValid) throw new Error(v.message);
  return transform(plaintext, matrixKey, true);
}

/** Dekripsi: P = K^-1 * C mod 26. Padding 'X' di akhir tidak dibuang otomatis. */
export function decryptHill(ciphertext, matrixKey) {
  const inv = inverseMatrix(matrixKey);
  return transform(ciphertext, inv, false);
}
