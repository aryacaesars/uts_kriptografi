/**
 * Playfair Cipher (26 Alfabet)
 * Sesuai Spesifikasi Tugas UTS Kriptografi
 * Penanggung Jawab: Andi Rafiyan (237006074)
 */

/**
 * Sanitasi teks khusus 26 alfabet:
 * - Mengubah ke huruf kapital (uppercase)
 * - Membuang angka, spasi, dan tanda baca
 * - Mengganti huruf 'J' menjadi 'I' (aturan matriks Playfair 5x5)
 * @param {string} text 
 * @returns {string}
 */
export function sanitizePlayfair(text) {
    if (!text) return "";
    return text
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .replace(/J/g, "I");
}

/**
 * Membentuk matriks kunci 5x5 Playfair (25 huruf, tanpa J / J digabung ke I).
 * @param {string} key 
 * @returns {string[][]} Matriks 5x5
 */
export function generatePlayfairMatrix(key) {
    const sanitizedKey = sanitizePlayfair(key);
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // 25 huruf tanpa J
    const used = new Set();
    const keyChars = [];

    // Masukkan huruf dari kunci terlebih dahulu (tanpa duplikasi)
    for (const ch of sanitizedKey) {
        if (!used.has(ch) && ch !== "J") {
            used.add(ch);
            keyChars.push(ch);
        }
    }

    // Masukkan sisa alfabet yang belum terpakai
    for (const ch of alphabet) {
        if (!used.has(ch)) {
            used.add(ch);
            keyChars.push(ch);
        }
    }

    // Bangun matriks 5x5
    const matrix = [];
    for (let r = 0; r < 5; r++) {
        matrix.push(keyChars.slice(r * 5, (r + 1) * 5));
    }
    return matrix;
}

/**
 * Mencari posisi baris dan kolom suatu huruf di matriks Playfair
 * @param {string[][]} matrix 
 * @param {string} char 
 * @returns {{row: number, col: number}}
 */
function findPosition(matrix, char) {
    const target = char === "J" ? "I" : char;
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (matrix[r][c] === target) {
                return { row: r, col: c };
            }
        }
    }
    throw new Error(`Karakter ${char} tidak ditemukan di matriks Playfair!`);
}

/**
 * Memecah teks plainteks menjadi pasangan bigram sesuai aturan:
 * - Jika terdapat huruf kembar dalam satu bigram, sisipkan 'X' (jika huruf kembarnya 'XX', sisipkan 'Z').
 * - Jika panjang akhir ganjil, tambahkan huruf penggenap 'X' (atau 'Z' jika huruf terakhir 'X').
 * @param {string} text 
 * @returns {string[]} Array of 2-character strings
 */
export function prepareBigrams(text) {
    const sanitized = sanitizePlayfair(text);
    const bigrams = [];
    let i = 0;

    while (i < sanitized.length) {
        const first = sanitized[i];
        if (i + 1 < sanitized.length) {
            const second = sanitized[i + 1];
            if (first === second) {
                // Huruf kembar
                const filler = first === "X" ? "Z" : "X";
                bigrams.push(first + filler);
                i += 1; // Karakter kedua akan diproses di bigram berikutnya
            } else {
                bigrams.push(first + second);
                i += 2;
            }
        } else {
            // Sisa 1 huruf di akhir (ganjil)
            const filler = first === "X" ? "Z" : "X";
            bigrams.push(first + filler);
            i += 1;
        }
    }

    return bigrams;
}

/**
 * Enkripsi Playfair Cipher (26 Alfabet)
 * @param {string} plaintext 
 * @param {string} key 
 * @returns {string} Ciphertext uppercase tanpa spasi
 */
export function encryptPlayfair(plaintext, key) {
    const matrix = generatePlayfairMatrix(key);
    const bigrams = prepareBigrams(plaintext);
    let ciphertext = "";

    for (const pair of bigrams) {
        const p1 = findPosition(matrix, pair[0]);
        const p2 = findPosition(matrix, pair[1]);

        if (p1.row === p2.row) {
            // Aturan 1: Baris sama -> Geser ke kanan secara siklis
            const c1 = matrix[p1.row][(p1.col + 1) % 5];
            const c2 = matrix[p2.row][(p2.col + 1) % 5];
            ciphertext += c1 + c2;
        } else if (p1.col === p2.col) {
            // Aturan 2: Kolom sama -> Geser ke bawah secara siklis
            const c1 = matrix[(p1.row + 1) % 5][p1.col];
            const c2 = matrix[(p2.row + 1) % 5][p2.col];
            ciphertext += c1 + c2;
        } else {
            // Aturan 3: Persegi -> Tukar sudut kolom
            const c1 = matrix[p1.row][p2.col];
            const c2 = matrix[p2.row][p1.col];
            ciphertext += c1 + c2;
        }
    }

    return ciphertext;
}

/**
 * Dekripsi Playfair Cipher (26 Alfabet)
 * @param {string} ciphertext 
 * @param {string} key 
 * @returns {string} Plaintext hasil dekripsi
 */
export function decryptPlayfair(ciphertext, key) {
    const matrix = generatePlayfairMatrix(key);
    const sanitized = sanitizePlayfair(ciphertext);
    let plaintext = "";

    // Ciphertext harus berupa pasangan 2 huruf (panjang genap)
    for (let i = 0; i < sanitized.length; i += 2) {
        if (i + 1 >= sanitized.length) break;
        const p1 = findPosition(matrix, sanitized[i]);
        const p2 = findPosition(matrix, sanitized[i + 1]);

        if (p1.row === p2.row) {
            // Baris sama -> Geser ke kiri secara siklis (-1 mod 5)
            const c1 = matrix[p1.row][(p1.col - 1 + 5) % 5];
            const c2 = matrix[p2.row][(p2.col - 1 + 5) % 5];
            plaintext += c1 + c2;
        } else if (p1.col === p2.col) {
            // Kolom sama -> Geser ke atas secara siklis (-1 mod 5)
            const c1 = matrix[(p1.row - 1 + 5) % 5][p1.col];
            const c2 = matrix[(p2.row - 1 + 5) % 5][p2.col];
            plaintext += c1 + c2;
        } else {
            // Persegi -> Tukar sudut kolom
            const c1 = matrix[p1.row][p2.col];
            const c2 = matrix[p2.row][p1.col];
            plaintext += c1 + c2;
        }
    }

    return plaintext;
}
