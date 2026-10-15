import * as ciphers from "../modules/index.js";

export const ALGORITHMS = [
  { id: "vigenere", name: "Vigenere Standard", family: "26 alfabet", owner: "Anggota 1", description: "Kunci diulang sepanjang pesan. Hanya huruf A-Z yang diproses." },
  { id: "autokey", name: "Auto-Key Vigenere", family: "26 alfabet", owner: "Anggota 1", description: "Kunci awal disambung dengan plainteks; dekripsi membangun kembali aliran kunci." },
  { id: "affine", name: "Affine Cipher", family: "26 alfabet", owner: "Anggota 1", description: "Substitusi C = (a × P + b) mod 26. Nilai a harus memiliki invers modulo 26." },
  { id: "playfair", name: "Playfair Cipher", family: "26 alfabet", owner: "Anggota 2", description: "Matriks 5×5, J digabung ke I. Huruf sisipan X/Z tetap ada pada hasil dekripsi." },
  { id: "hill", name: "Hill Cipher", family: "26 alfabet", owner: "Anggota 3", description: "Perkalian matriks blok modulo 26. Padding X muncul kembali setelah dekripsi." },
  { id: "extended", name: "Extended Vigenere", family: "256 byte", owner: "Anggota 2", description: "Memproses seluruh byte, termasuk header file. Cocok untuk semua jenis berkas." },
  { id: "super", name: "Super Enkripsi", family: "256 byte", owner: "Anggota 2", description: "Extended Vigenere dilanjutkan transposisi kolom; dekripsi membalik urutannya." },
  { id: "enigma", name: "Enigma M3", family: "Bonus · 26 alfabet", owner: "Anggota 2", description: "Tiga rotor, reflektor, dan plugboard. Gunakan konfigurasi awal yang sama untuk dekripsi." },
];

export const isBinary = id => id === "extended" || id === "super";
export const hillAvailable = () => ciphers.getHillModule() !== null;
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const BINARY_PAYLOAD_MARKER = new TextEncoder().encode("KRIP-DATA-V1\0");
// A maximum-sized plaintext must still fit when its KRIP container is uploaded.
export const maxInputBytes = (operation, fileName) => MAX_INPUT_BYTES + (operation === "decrypt" && fileName ? 260 : 0);

function addBinaryPayloadMarker(bytes) {
  const payload = new Uint8Array(BINARY_PAYLOAD_MARKER.length + bytes.length);
  payload.set(BINARY_PAYLOAD_MARKER);
  payload.set(bytes, BINARY_PAYLOAD_MARKER.length);
  return payload;
}

function removeBinaryPayloadMarker(bytes) {
  if (bytes.length < BINARY_PAYLOAD_MARKER.length || BINARY_PAYLOAD_MARKER.some((value, index) => bytes[index] !== value)) {
    throw new Error("Kunci salah atau payload berkas rusak. Gunakan kunci dan konfigurasi yang sama seperti saat enkripsi.");
  }
  return bytes.slice(BINARY_PAYLOAD_MARKER.length);
}

function decodeText(bytes) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { throw new Error("Cipher alfabet menerima teks UTF-8. Untuk berkas biner gunakan Extended Vigenere atau Super Enkripsi."); }
  if ([...text].some(ch => ch.charCodeAt(0) < 32 && !"\t\n\r".includes(ch))) throw new Error("Berkas mengandung data biner. Pilih Extended Vigenere atau Super Enkripsi.");
  return text;
}

function validateEnigma(config) {
  if (config.rotors.length !== 3 || new Set(config.rotors).size !== 3 || config.rotors.some(r => !ciphers.ROTOR_DEFINITIONS[r])) throw new Error("Pilih tiga rotor berbeda dari I sampai V.");
  if (!/^[A-Z]{3}$/.test(config.positions) || !/^[A-Z]{3}$/.test(config.rings)) throw new Error("Posisi rotor dan ring harus tepat tiga huruf A-Z.");
  if (!["B", "C"].includes(config.reflector)) throw new Error("Reflektor harus B atau C.");
  const used = new Set();
  if (config.plugboard.length > 10) throw new Error("Plugboard maksimal sepuluh pasangan.");
  for (const pair of config.plugboard) {
    if (!/^[A-Z]{2}$/.test(pair) || pair[0] === pair[1] || [...pair].some(ch => used.has(ch))) throw new Error("Plugboard harus pasangan dua huruf berbeda tanpa huruf yang dipakai ulang.");
    for (const ch of pair) used.add(ch);
  }
}

export function processRequest({ algorithm, operation, inputBytes, fileName = "", key = "", a = 7, b = 10, transpositionKey = "KUNCI", matrixKey, enigma }) {
  if (!ALGORITHMS.some(item => item.id === algorithm)) throw new Error("Algoritma tidak dikenal.");
  if (!["encrypt", "decrypt"].includes(operation)) throw new Error("Operasi tidak dikenal.");
  if (!(inputBytes instanceof Uint8Array)) throw new TypeError("Input harus berupa Uint8Array.");
  if (inputBytes.length > maxInputBytes(operation, fileName)) throw new Error("Batas input 10 MiB. Pilih berkas atau teks yang lebih kecil.");
  let data = inputBytes;
  let extension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "bin";
  if (operation === "decrypt" && fileName) {
    const container = ciphers.unpackageBinaryFile(data);
    data = container.encryptedBytes;
    extension = container.originalExtension;
  }
  const maxPayloadBytes = MAX_INPUT_BYTES + (isBinary(algorithm) ? BINARY_PAYLOAD_MARKER.length : 0);
  if (data.length > maxPayloadBytes) throw new Error("Batas payload 10 MiB. Pilih berkas atau teks yang lebih kecil.");
  if (!/^[a-zA-Z0-9_-]{1,255}$/.test(extension)) throw new Error("Ekstensi pada berkas tidak valid.");
  let text = null;
  let normalized = null;
  let output;
  if (isBinary(algorithm)) {
    if (typeof key !== "string" || key.length === 0) throw new Error("Kunci byte tidak boleh kosong.");
    const binaryData = operation === "encrypt" ? addBinaryPayloadMarker(data) : data;
    if (algorithm === "super") {
      if (typeof transpositionKey === "number" && (!Number.isInteger(transpositionKey) || transpositionKey < 2 || transpositionKey > 1024)) throw new Error("Jumlah kolom harus bilangan bulat dari 2 sampai 1024.");
      if (typeof transpositionKey === "string" && (transpositionKey.trim().length < 2 || transpositionKey.length > 1024)) throw new Error("Kunci kolom harus terdiri dari 2 sampai 1024 karakter.");
      output = (operation === "encrypt" ? ciphers.encryptSuper : ciphers.decryptSuper)(binaryData, key, transpositionKey);
    } else output = (operation === "encrypt" ? ciphers.encryptExtendedVigenere : ciphers.decryptExtendedVigenere)(binaryData, key);
    if (operation === "decrypt") output = removeBinaryPayloadMarker(output);
  } else {
    // Berkas alfabet sengaja hanya menerima teks biasa, bukan format berstruktur/biner.
    if (operation === "encrypt" && fileName && !/\.(txt|md|csv|json|xml|html|sql|log)$/i.test(fileName)) throw new Error("Untuk cipher alfabet unggah teks UTF-8 (.txt/.md/.csv/.json/.xml/.html/.sql/.log). Berkas lain memakai cipher byte.");
    const source = decodeText(data);
    normalized = ciphers.sanitizeText(source);
    if (!normalized) throw new Error("Pesan harus mengandung setidaknya satu huruf A-Z setelah sanitasi.");
    const direction = operation === "encrypt" ? "encrypt" : "decrypt";
    if (algorithm === "affine") text = ciphers[`${direction}Affine`](source, a, b);
    else if (algorithm === "vigenere") text = ciphers[`${direction}VigenereStandard`](source, key);
    else if (algorithm === "autokey") text = ciphers[`${direction}AutoKeyVigenere`](source, key);
    else if (algorithm === "playfair") {
      const cleanKey = ciphers.requireAlphabetKey(key);
      if (operation === "decrypt" && normalized.length % 2) throw new Error("Cipherteks Playfair harus memiliki jumlah huruf genap.");
      text = ciphers[`${direction}Playfair`](normalized, cleanKey);
    } else if (algorithm === "enigma") {
      validateEnigma(enigma);
      text = ciphers.processEnigma(normalized, enigma);
    } else if (algorithm === "hill") {
      if (!hillAvailable()) throw new Error("Modul Hill belum tersedia. Daftarkan modul Anggota 3 di src/modules/index.js sesuai panduan serah-terima.");
      const hill = ciphers.getHillModule();
      const validation = hill.validateHillMatrix(matrixKey);
      if (!validation.isValid) throw new Error(validation.message);
      text = hill[`${direction}Hill`](normalized, matrixKey);
    }
    output = new TextEncoder().encode(text);
    extension = "txt";
  }
  const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "pesan";
  return {
    bytes: output, text, normalized, inputBytes: data,
    downloadBytes: operation === "encrypt" ? ciphers.packageBinaryFile(output, extension) : output,
    downloadName: operation === "encrypt" ? `${base}.dat` : `${base}.${extension}`,
    algorithm, operation,
  };
}
