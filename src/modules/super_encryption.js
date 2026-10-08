/**
 * Super Enkripsi (Kombinasi Extended Vigenere Cipher + Cipher Transposisi Kolom)
 * Beroperasi langsung pada data biner sembarang (Uint8Array / Byte Stream)
 * Sesuai Spesifikasi Tugas UTS Kriptografi
 * Penanggung Jawab: Andi Rafiyan (237006074)
 */

import { encryptExtendedVigenere, decryptExtendedVigenere, normalizeDataBytes } from "./extended_vigenere.js";

/**
 * Menghitung urutan permutasi kolom berdasarkan kunci transposisi.
 * Jika key berupa string (misal "KUNCI"):
 * Urutan alfabet: C (kolom 3), I (kolom 4), K (kolom 0), N (kolom 2), U (kolom 1)
 * Menghasilkan urutan indeks kolom: [3, 4, 0, 2, 1]
 * Jika key berupa angka (misal 5): [0, 1, 2, 3, 4]
 * @param {string|number} key 
 * @returns {number[]} Array indeks kolom terurut
 */
export function getColumnPermutationOrder(key) {
    if (typeof key === "number") {
        if (key < 2) throw new Error("Jumlah kolom transposisi minimal 2!");
        return Array.from({ length: key }, (_, i) => i);
    }

    if (typeof key !== "string" || key.trim().length < 2) {
        throw new Error("Kunci transposisi harus string minimal 2 karakter atau angka >= 2!");
    }

    const cleanKey = key.toUpperCase();
    const indexed = cleanKey.split("").map((ch, idx) => ({ ch, idx }));

    // Urutkan berdasarkan abjad (stable sort untuk karakter kembar)
    indexed.sort((a, b) => {
        if (a.ch < b.ch) return -1;
        if (a.ch > b.ch) return 1;
        return a.idx - b.idx;
    });

    return indexed.map(item => item.idx);
}

/**
 * Enkripsi Transposisi Kolom (Irregular Columnar Transposition) pada Byte Array
 * Mempertahankan ukuran byte secara persis (lossless tanpa padding berlebih)
 * @param {Uint8Array} bytes 
 * @param {string|number} key 
 * @returns {Uint8Array}
 */
export function encryptColumnarTransposition(bytes, key) {
    const colOrder = getColumnPermutationOrder(key);
    const numCols = colOrder.length;
    const totalBytes = bytes.length;

    if (totalBytes === 0 || numCols <= 1) return new Uint8Array(bytes);

    const numRows = Math.ceil(totalBytes / numCols);
    const fullCols = totalBytes % numCols === 0 ? numCols : totalBytes % numCols;

    // Hitung panjang tiap kolom asli k
    const colLengths = new Array(numCols);
    for (let c = 0; c < numCols; c++) {
        colLengths[c] = c < fullCols ? numRows : numRows - 1;
    }

    // Bangun grid baris demi baris
    const grid = [];
    let ptr = 0;
    for (let r = 0; r < numRows; r++) {
        const row = [];
        for (let c = 0; c < numCols; c++) {
            if (r < colLengths[c]) {
                row.push(bytes[ptr++]);
            } else {
                row.push(null);
            }
        }
        grid.push(row);
    }

    // Baca kolom demi kolom sesuai permutasi colOrder
    const output = new Uint8Array(totalBytes);
    let outPtr = 0;

    for (const c of colOrder) {
        const len = colLengths[c];
        for (let r = 0; r < len; r++) {
            output[outPtr++] = grid[r][c];
        }
    }

    return output;
}

/**
 * Dekripsi Transposisi Kolom (Invers Irregular Columnar Transposition) pada Byte Array
 * @param {Uint8Array} cipherBytes 
 * @param {string|number} key 
 * @returns {Uint8Array}
 */
export function decryptColumnarTransposition(cipherBytes, key) {
    const colOrder = getColumnPermutationOrder(key);
    const numCols = colOrder.length;
    const totalBytes = cipherBytes.length;

    if (totalBytes === 0 || numCols <= 1) return new Uint8Array(cipherBytes);

    const numRows = Math.ceil(totalBytes / numCols);
    const fullCols = totalBytes % numCols === 0 ? numCols : totalBytes % numCols;

    // Hitung panjang tiap kolom asli k
    const colLengths = new Array(numCols);
    for (let c = 0; c < numCols; c++) {
        colLengths[c] = c < fullCols ? numRows : numRows - 1;
    }

    // Siapkan grid kosong
    const grid = Array.from({ length: numRows }, () => new Array(numCols).fill(null));

    // Isi grid per kolom sesuai urutan permutasi colOrder
    let inPtr = 0;
    for (const c of colOrder) {
        const len = colLengths[c];
        for (let r = 0; r < len; r++) {
            grid[r][c] = cipherBytes[inPtr++];
        }
    }

    // Baca grid baris demi baris untuk merekonstruksi data awal
    const output = new Uint8Array(totalBytes);
    let outPtr = 0;
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (r < colLengths[c]) {
                output[outPtr++] = grid[r][c];
            }
        }
    }

    return output;
}

/**
 * Super Enkripsi:
 * Langkah 1 (Konfusi): Extended Vigenere Cipher pada byte mentah
 * Langkah 2 (Difusi) : Transposisi Kolom pada byte hasil Extended Vigenere
 * @param {Uint8Array|string} dataBytes 
 * @param {string} vigenereKey 
 * @param {string|number} transpositionKey 
 * @returns {Uint8Array}
 */
export function encryptSuper(dataBytes, vigenereKey, transpositionKey) {
    const raw = normalizeDataBytes(dataBytes);
    // 1. Substitusi Extended Vigenere
    const subBytes = encryptExtendedVigenere(raw, vigenereKey);
    // 2. Transposisi Kolom
    const superBytes = encryptColumnarTransposition(subBytes, transpositionKey);
    return superBytes;
}

/**
 * Super Dekripsi:
 * Langkah 1: Invers Transposisi Kolom
 * Langkah 2: Invers Extended Vigenere Cipher
 * @param {Uint8Array|string} cipherBytes 
 * @param {string} vigenereKey 
 * @param {string|number} transpositionKey 
 * @returns {Uint8Array}
 */
export function decryptSuper(cipherBytes, vigenereKey, transpositionKey) {
    const raw = normalizeDataBytes(cipherBytes);
    // 1. Balikkan Transposisi Kolom
    const subBytes = decryptColumnarTransposition(raw, transpositionKey);
    // 2. Balikkan Extended Vigenere
    const originalBytes = decryptExtendedVigenere(subBytes, vigenereKey);
    return originalBytes;
}
