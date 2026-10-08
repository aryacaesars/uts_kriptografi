/**
 * Binary File Container (.dat)
 * Mengemas payload terenkripsi bersama metadata ekstensi file asli
 * Sesuai Butir 8 & 9 Spesifikasi Soal UTS Kriptografi
 * Penanggung Jawab: Andi Rafiyan (237006074)
 */

export const MAGIC_BYTES = new Uint8Array([0x4B, 0x52, 0x49, 0x50]); // "KRIP"

/**
 * Membungkus payload terenkripsi ke dalam kontainer file biner (.dat)
 * Format Header:
 * [4 Byte Magic: "KRIP"] + [1 Byte Panjang Ekstensi L] + [L Byte Ekstensi ASCII] + [Payload Terenkripsi]
 * 
 * @param {Uint8Array} encryptedBytes Byte array hasil enkripsi
 * @param {string} originalExtension Ekstensi asli file tanpa titik (misal: "docx", "png", "mp4")
 * @returns {Uint8Array} Byte array kontainer utuh yang siap disimpan sebagai file .dat
 */
export function packageBinaryFile(encryptedBytes, originalExtension) {
    if (!(encryptedBytes instanceof Uint8Array)) {
        throw new Error("encryptedBytes harus berupa Uint8Array!");
    }

    const cleanExt = (originalExtension || "dat").replace(/^\./, "").toLowerCase();
    const extBytes = new TextEncoder().encode(cleanExt);
    const extLen = extBytes.length;

    if (extLen > 255) {
        throw new Error("Panjang ekstensi file melebihi batas maksimum 255 karakter!");
    }

    const totalLength = MAGIC_BYTES.length + 1 + extLen + encryptedBytes.length;
    const container = new Uint8Array(totalLength);

    // 1. Tulis Magic Bytes (4 byte)
    container.set(MAGIC_BYTES, 0);

    // 2. Tulis Panjang Ekstensi (1 byte)
    container[MAGIC_BYTES.length] = extLen;

    // 3. Tulis String Ekstensi (L byte)
    container.set(extBytes, MAGIC_BYTES.length + 1);

    // 4. Tulis Payload Terenkripsi
    container.set(encryptedBytes, MAGIC_BYTES.length + 1 + extLen);

    return container;
}

/**
 * Membongkar kontainer file biner (.dat) untuk mengekstrak ekstensi asli dan payload
 * @param {Uint8Array} containerBytes Byte array dari file .dat
 * @returns {{ originalExtension: string, encryptedBytes: Uint8Array }}
 */
export function unpackageBinaryFile(containerBytes) {
    if (!(containerBytes instanceof Uint8Array)) {
        throw new Error("containerBytes harus berupa Uint8Array!");
    }

    const headerMinLength = MAGIC_BYTES.length + 1;
    if (containerBytes.length < headerMinLength) {
        throw new Error("Berkas terlalu kecil, bukan kontainer cipherteks yang valid!");
    }

    // 1. Validasi Magic Bytes ("KRIP")
    for (let i = 0; i < MAGIC_BYTES.length; i++) {
        if (containerBytes[i] !== MAGIC_BYTES[i]) {
            throw new Error("Magic header tidak cocok! Berkas ini bukan file cipherteks berformat KRIP (.dat).");
        }
    }

    // 2. Baca Panjang Ekstensi
    const extLen = containerBytes[MAGIC_BYTES.length];
    const headerTotalLength = MAGIC_BYTES.length + 1 + extLen;

    if (containerBytes.length < headerTotalLength) {
        throw new Error("Struktur kontainer rusak (panjang berkas tidak mencukupi untuk membaca ekstensi).");
    }

    // 3. Baca Ekstensi Asli
    const extBytes = containerBytes.slice(MAGIC_BYTES.length + 1, headerTotalLength);
    const originalExtension = new TextDecoder().decode(extBytes);

    // 4. Ekstrak Payload
    const encryptedBytes = containerBytes.slice(headerTotalLength);

    return {
        originalExtension: originalExtension || "bin",
        encryptedBytes
    };
}
