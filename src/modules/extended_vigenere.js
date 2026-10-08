/**
 * Extended Vigenere Cipher (256 Karakter ASCII / Byte-Level)
 * Sesuai Spesifikasi Tugas UTS Kriptografi
 * Penanggung Jawab: Andi Rafiyan (237006074)
 */

/**
 * Mengonversi input kunci (string atau Uint8Array) ke Uint8Array murni
 * @param {string|Uint8Array} key 
 * @returns {Uint8Array}
 */
export function normalizeKeyBytes(key) {
    if (!key || (typeof key === "string" && key.length === 0) || (key instanceof Uint8Array && key.length === 0)) {
        throw new Error("Kunci tidak boleh kosong!");
    }
    if (typeof key === "string") {
        return new TextEncoder().encode(key);
    }
    if (key instanceof Uint8Array) {
        return key;
    }
    if (Array.isArray(key)) {
        return new Uint8Array(key);
    }
    throw new Error("Format kunci tidak didukung (harus string atau Uint8Array).");
}

/**
 * Mengonversi input data (string atau Uint8Array) ke Uint8Array murni
 * @param {string|Uint8Array} data 
 * @returns {Uint8Array}
 */
export function normalizeDataBytes(data) {
    if (typeof data === "string") {
        return new TextEncoder().encode(data);
    }
    if (data instanceof Uint8Array) {
        return data;
    }
    if (Array.isArray(data)) {
        return new Uint8Array(data);
    }
    throw new Error("Format data tidak didukung (harus string atau Uint8Array).");
}

/**
 * Enkripsi Extended Vigenere Cipher (Modulo 256 per byte)
 * C[i] = (P[i] + K[i mod m]) mod 256
 * @param {Uint8Array|string} dataBytes Raw data byte array atau text
 * @param {Uint8Array|string} key String kunci atau byte array kunci
 * @returns {Uint8Array} Byte array hasil enkripsi
 */
export function encryptExtendedVigenere(dataBytes, key) {
    const bytes = normalizeDataBytes(dataBytes);
    const keyBytes = normalizeKeyBytes(key);
    const output = new Uint8Array(bytes.length);
    const m = keyBytes.length;

    for (let i = 0; i < bytes.length; i++) {
        output[i] = (bytes[i] + keyBytes[i % m]) % 256;
    }

    return output;
}

/**
 * Dekripsi Extended Vigenere Cipher (Modulo 256 per byte)
 * P[i] = (C[i] - K[i mod m] + 256) mod 256
 * @param {Uint8Array|string} cipherBytes Byte array hasil enkripsi
 * @param {Uint8Array|string} key String kunci atau byte array kunci
 * @returns {Uint8Array} Byte array hasil dekripsi (data asli)
 */
export function decryptExtendedVigenere(cipherBytes, key) {
    const bytes = normalizeDataBytes(cipherBytes);
    const keyBytes = normalizeKeyBytes(key);
    const output = new Uint8Array(bytes.length);
    const m = keyBytes.length;

    for (let i = 0; i < bytes.length; i++) {
        output[i] = (bytes[i] - keyBytes[i % m] + 256) % 256;
    }

    return output;
}
