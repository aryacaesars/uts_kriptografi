import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../src/modules/index.js";
import { processRequest, MAX_INPUT_BYTES, hillAvailable } from "../src/lib/workbench.js";

const encode = value => new TextEncoder().encode(value);
const request = (options = {}) => processRequest({ algorithm: "vigenere", operation: "encrypt", inputBytes: encode("Attack at dawn! 123"), key: "LEMON", ...options });

test("Sanitizer keeps only original ASCII alphabet, including Unicode edge cases", () => {
  assert.equal(c.sanitizeText("Halo, Dunia 123! ßéı🙂"), "HALODUNIA");
  assert.equal(c.sanitizeText("123!?"), "");
  assert.throws(() => c.sanitizeText(null), /string/);
});

test("Vigenere known answer and normalized key", () => {
  assert.equal(c.encryptVigenereStandard("Attack at dawn!", "le-mon 123"), "LXFOPVEFRNHR");
  assert.equal(c.decryptVigenereStandard("LXF OPV EFR NHR!", "LEMON"), "ATTACKATDAWN");
});

test("Autokey known answer uses recovered plaintext, not repeated seed", () => {
  assert.equal(c.encryptAutoKeyVigenere("ATTACKATDAWN", "QUEENLY"), "QNXEPVYTWTWP");
  assert.equal(c.decryptAutoKeyVigenere("QNXEPVYTWTWP", "QUEENLY"), "ATTACKATDAWN");
});

test("Affine known answer, inverse, and all valid keys", () => {
  assert.equal(c.encryptAffine("AFFINE CIPHER", 5, 8), "IHHWVCSWFRCP");
  assert.equal(c.decryptAffine("IHHWVCSWFRCP", 5, 8), "AFFINECIPHER");
  assert.equal(c.modInverse(7), 15);
  for (const a of [...c.AFFINE_A_VALUES, -19, 33, Number.MAX_SAFE_INTEGER]) {
    for (let b = 0; b < 26; b++) {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      assert.equal(c.decryptAffine(c.encryptAffine(alphabet, a, b), a, b), alphabet);
    }
  }
});

test("Invalid and empty keys fail in both directions", () => {
  for (const fn of [c.encryptVigenereStandard, c.decryptVigenereStandard, c.encryptAutoKeyVigenere, c.decryptAutoKeyVigenere]) {
    for (const key of ["", "123!", "🙂"]) assert.throws(() => fn("ABC", key), /Kunci/);
  }
  for (const fn of [c.encryptAffine, c.decryptAffine]) {
    for (const a of [0, 2, 13, 26, 1.5, Infinity, NaN]) assert.throws(() => fn("ABC", a, 0), /Nilai a/);
    for (const b of [-1, 26, 1.5, NaN]) assert.throws(() => fn("ABC", 7, b), /Nilai b/);
  }
});

test("Member 1 assignment samples and long seed round trips", () => {
  for (const [encrypt, decrypt, plain, key] of [
    [c.encryptVigenereStandard, c.decryptVigenereStandard, "KRIPTOGRAFI UNSIL", "BAGUS"],
    [c.encryptAutoKeyVigenere, c.decryptAutoKeyVigenere, "TEKNIKINFORMATIKA", "UNSIL"],
  ]) {
    for (const seed of [key, "A", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]) {
      for (const text of [plain, "A", "", plain.repeat(100)]) {
        assert.equal(decrypt(encrypt(text, seed), seed), c.sanitizeText(text));
      }
    }
  }
  assert.equal(c.decryptAffine(c.encryptAffine("UNIVERSITAS SILIWANGI", 7, 10), 7, 10), "UNIVERSITASSILIWANGI");
});

test("Base64 preserves UTF-8, all byte values, and arrays beyond argument limits", () => {
  const data = Uint8Array.from({ length: 100000 }, (_, i) => i % 256);
  assert.deepEqual(c.base64ToBytes(c.bytesToBase64(data)), data);
  assert.equal(new TextDecoder().decode(c.base64ToBytes(c.toBase64("Halo 🌏"))), "Halo 🌏");
  assert.equal(c.formatScreenOutput("Ab C", "UPPERCASE_NO_SPACE"), "ABC");
  assert.equal(c.formatScreenOutput("Ab C", "LOWERCASE_NO_SPACE"), "abc");
  assert.equal(c.formatScreenOutput("AB", "BASE64"), "QUI=");
  for (const value of ["!@#$", "a", "a===", "SGVsbG8"]) assert.throws(() => c.base64ToBytes(value), /Base64/);
});

test("Three member 1 ciphers: UTF-8 upload, KRIP download and decrypt", () => {
  for (const algorithm of ["vigenere", "autokey", "affine"]) {
    const encrypted = request({ algorithm, fileName: "catatan.txt" });
    assert.equal(encrypted.downloadName, "catatan.dat");
    assert.equal(new TextDecoder().decode(encrypted.downloadBytes.slice(0, 4)), "KRIP");
    const decrypted = request({ algorithm, operation: "decrypt", inputBytes: encrypted.downloadBytes, fileName: encrypted.downloadName });
    assert.equal(decrypted.text, "ATTACKATDAWN");
    assert.equal(decrypted.downloadName, "catatan.txt");
  }
});

test("Alphabet input rejects empty messages and binary files", () => {
  assert.throws(() => request({ inputBytes: encode("123 !") }), /huruf/);
  assert.throws(() => request({ inputBytes: new Uint8Array([0, 65]), fileName: "x.txt" }), /biner/);
  assert.throws(() => request({ inputBytes: new Uint8Array([255]), fileName: "x.txt" }), /UTF-8/);
  assert.throws(() => request({ fileName: "x.png" }), /cipher byte/);
});

test("Integrated binary ciphers restore every byte and original extension", () => {
  for (const algorithm of ["extended", "super"]) {
    for (const length of [0, 1, 4, 5, 6, 255, 256, 1025]) {
      const data = Uint8Array.from({ length }, (_, i) => i % 256);
      for (const transpositionKey of [2, 5, "BALLOON", "KUNCI"]) {
        const encrypted = request({ algorithm, inputBytes: data, fileName: "sample.png", key: "kunci 🔑", transpositionKey });
        const decrypted = request({ algorithm, operation: "decrypt", inputBytes: encrypted.downloadBytes, fileName: encrypted.downloadName, key: "kunci 🔑", transpositionKey });
        assert.deepEqual(decrypted.bytes, data);
        assert.equal(decrypted.downloadName, "sample.png");
      }
    }
  }
});

test("Integrated binary ciphers reject a changed key or Super transposition key", () => {
  for (const algorithm of ["extended", "super"]) {
    const encrypted = request({ algorithm, inputBytes: encode("data rahasia"), fileName: "sample.png", key: "kunci-benar", transpositionKey: "KUNCI" });
    assert.throws(() => request({ algorithm, operation: "decrypt", inputBytes: encrypted.downloadBytes, fileName: encrypted.downloadName, key: "kunci-salah", transpositionKey: "KUNCI" }), /Kunci salah/);
    if (algorithm === "super") assert.throws(() => request({ algorithm, operation: "decrypt", inputBytes: encrypted.downloadBytes, fileName: encrypted.downloadName, key: "kunci-benar", transpositionKey: "RAHASIA" }), /Kunci salah/);
  }
});

test("Container validation rejects invalid magic, truncation and unsafe extensions", () => {
  for (const inputBytes of [encode("abc"), encode("FAKE\u0003txtabc"), new Uint8Array([75,82,73,80,20,65])]) {
    assert.throws(() => request({ operation: "decrypt", fileName: "bad.dat", inputBytes }));
  }
  assert.throws(() => request({ algorithm: "extended", operation: "decrypt", fileName: "bad.dat", inputBytes: c.packageBinaryFile(encode("A"), "../x") }), /Ekstensi/);
});

test("10 MiB input remains decryptable after container header is added", () => {
  const inputBytes = new Uint8Array(MAX_INPUT_BYTES).fill(255);
  const encrypted = request({ algorithm: "extended", fileName: "limit.bin", inputBytes });
  const decrypted = request({ algorithm: "extended", operation: "decrypt", fileName: "limit.dat", inputBytes: encrypted.downloadBytes });
  assert.deepEqual(decrypted.bytes, inputBytes);
  assert.throws(() => request({ inputBytes: new Uint8Array(MAX_INPUT_BYTES + 1) }), /10 MiB/);
  assert.throws(() => request({ algorithm: "extended", operation: "decrypt", fileName: "limit.dat", inputBytes: c.packageBinaryFile(new Uint8Array(MAX_INPUT_BYTES + 1), "bin") }), /payload/);
});

test("Playfair and Enigma integration known answers", () => {
  assert.equal(request({ algorithm: "playfair", inputBytes: encode("HIDETHEGOLDINTHETREESTUMP"), key: "PLAYFAIR EXAMPLE" }).text, "BMODZBXDNABEKUDMUIXMMOUVIF");
  assert.throws(() => request({ algorithm: "playfair", operation: "decrypt", inputBytes: encode("ABC") }), /genap/);
  const enigma = { rotors: ["I", "II", "III"], reflector: "B", positions: "AAA", rings: "AAA", plugboard: [] };
  assert.equal(request({ algorithm: "enigma", inputBytes: encode("AAAAA"), enigma }).text, "BDZGO");
  assert.equal(request({ algorithm: "enigma", operation: "decrypt", inputBytes: encode("BDZGO"), enigma }).text, "AAAAA");
  assert.throws(() => request({ algorithm: "enigma", enigma: { ...enigma, plugboard: ["AB", "AC"] } }), /Plugboard/);
});

test("Integrated Hill Cipher supports 2x2, 3x3, padding and invalid matrices", () => {
  assert.equal(hillAvailable(), true);
  const cases = [
    ["HELP", [[3, 3], [2, 5]], "HIAT", "HELP"],
    ["ACT", [[6, 24, 1], [13, 16, 10], [20, 17, 15]], "POH", "ACT"],
    ["HALO DUNIA!", [[3, 3], [2, 5]], "VOXORCLORL", "HALODUNIAX"],
  ];
  for (const [plaintext, matrixKey, ciphertext, recovered] of cases) {
    assert.equal(request({ algorithm: "hill", inputBytes: encode(plaintext), matrixKey }).text, ciphertext);
    assert.equal(request({ algorithm: "hill", operation: "decrypt", inputBytes: encode(ciphertext), matrixKey }).text, recovered);
  }
  assert.equal(c.encryptHill("ACT", [[6, 24, 1], [13, 16, 10], [20, 17, 15]]), "POH");
  assert.throws(() => request({ algorithm: "hill", matrixKey: [[2, 4], [1, 2]] }), /tidak punya invers/);
  assert.equal(request({ algorithm: "hill", inputBytes: encode("Straße"), matrixKey: [[3, 3], [2, 5]] }).normalized, "STRAE");
  assert.throws(() => request({ algorithm: "hill", operation: "decrypt", inputBytes: encode("ABC"), matrixKey: [[3, 3], [2, 5]] }), /kelipatan/);
});
