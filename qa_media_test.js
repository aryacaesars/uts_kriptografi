/**
 * QA 5 Media - UTS Kriptografi (Dhiya, 237006066)
 *
 * Alur per berkas: baca byte mentah -> enkripsi -> bungkus .dat (header KRIP)
 * -> buka bungkus -> dekripsi -> bandingkan SHA-256 asli vs hasil dekripsi.
 *
 * Pemakaian:
 *   node qa_media_test.js <folder_sampel> [--engine ./engine_andi.js] [--out ./qa_output]
 *
 * Folder sampel berisi 5 berkas (ekstensi bebas): .txt/.docx, .png/.jpg,
 * .sqlite/.db, .mp3/.wav, .mp4
 *
 * Modul --engine harus mengekspor sesuai KONTRAK_INTERFACE_DAN_FUNGSI.txt:
 *   encryptExtendedVigenere, decryptExtendedVigenere,
 *   encryptSuper, decryptSuper,
 *   packageBinaryFile, unpackageBinaryFile
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join, extname, basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// ---------- argumen ----------
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const sampleDir = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!sampleDir) {
  console.error("Pemakaian: node qa_media_test.js <folder_sampel> [--engine ./engine.js] [--out ./qa_output]");
  process.exit(2);
}
const outDir = resolve(opt("--out", "./qa_output"));
const enginePath = resolve(opt("--engine", "./engine_andi.js"));
const VIG_KEY = opt("--key", "KRIPTOGRAFI2026");
const TRANS_KEY = opt("--tkey", "UNSIL");

const engine = await import(pathToFileURL(enginePath).href);
for (const fn of [
  "encryptExtendedVigenere", "decryptExtendedVigenere",
  "encryptSuper", "decryptSuper",
  "packageBinaryFile", "unpackageBinaryFile",
]) {
  if (typeof engine[fn] !== "function") {
    console.error(`Engine ${enginePath} tidak mengekspor fungsi '${fn}' (lihat kontrak).`);
    process.exit(2);
  }
}

// ---------- util ----------
const sha256 = (u8) => createHash("sha256").update(u8).digest("hex");
const eq = (a, b) => a.length === b.length && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;

/** Persentase byte yang berubah posisi demi posisi (payload vs asli). */
function diffPercent(a, b) {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let d = 0;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) d++;
  return (d / n) * 100;
}

const hex = (u8, n = 16) => Array.from(u8.slice(0, n), (b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();

const KIND = {
  ".txt": "Teks", ".docx": "Teks", ".pdf": "Dokumen", ".png": "Gambar", ".jpg": "Gambar", ".jpeg": "Gambar",
  ".sqlite": "Database", ".db": "Database", ".sql": "Database",
  ".mp3": "Audio", ".wav": "Audio", ".mp4": "Video", ".mkv": "Video",
};

// ---------- jalankan ----------
mkdirSync(outDir, { recursive: true });
const files = readdirSync(sampleDir)
  .filter((f) => statSync(join(sampleDir, f)).isFile())
  .sort();

if (files.length === 0) {
  console.error(`Tidak ada berkas di ${sampleDir}`);
  process.exit(2);
}

const methods = {
  "Extended Vigenere": {
    enc: (d) => engine.encryptExtendedVigenere(d, VIG_KEY),
    dec: (d) => engine.decryptExtendedVigenere(d, VIG_KEY),
  },
  "Super Enkripsi": {
    enc: (d) => engine.encryptSuper(d, VIG_KEY, TRANS_KEY),
    dec: (d) => engine.decryptSuper(d, VIG_KEY, TRANS_KEY),
  },
};

const rows = [];
let allOk = true;

for (const f of files) {
  const ext = extname(f).slice(1).toLowerCase();
  const media = KIND["." + ext] ?? "Lainnya";
  const original = new Uint8Array(readFileSync(join(sampleDir, f)));
  const hashOrig = sha256(original);

  for (const [mName, m] of Object.entries(methods)) {
    const t0 = performance.now();
    const encrypted = m.enc(original);
    const container = engine.packageBinaryFile(encrypted, ext);
    const tEnc = performance.now() - t0;

    // simpan .dat agar bisa dicoba dibuka manual (bukti "tidak bisa dibuka")
    const tag = mName === "Super Enkripsi" ? "super" : "extvig";
    const datName = `${basename(f, extname(f))}_${tag}_encrypted.dat`;
    writeFileSync(join(outDir, datName), container);

    const t1 = performance.now();
    const un = engine.unpackageBinaryFile(container);
    const decrypted = m.dec(un.encryptedBytes);
    const tDec = performance.now() - t1;

    const restoredName = `${basename(f, extname(f))}_${tag}_decrypted.${un.originalExtension}`;
    writeFileSync(join(outDir, restoredName), decrypted);

    const hashDec = sha256(decrypted);
    const ok = eq(original, decrypted) && hashOrig === hashDec && un.originalExtension === ext;
    if (!ok) allOk = false;

    rows.push({
      media, file: f, method: mName,
      sizeOrig: original.length, sizeDat: container.length,
      headerOrig: hex(original), headerEnc: hex(encrypted),
      changedPct: diffPercent(original, encrypted).toFixed(2),
      extRestored: un.originalExtension,
      hashOrig, hashDec, identical: ok,
      msEnc: tEnc.toFixed(1), msDec: tDec.toFixed(1),
      datName, restoredName,
    });
  }
}

// ---------- ringkasan ----------
console.log(`\nQA 5 Media | kunci Vigenere="${VIG_KEY}" | kunci transposisi="${TRANS_KEY}"`);
console.log("=".repeat(100));
for (const r of rows) {
  console.log(
    `[${r.identical ? "LULUS" : "GAGAL"}] ${r.media.padEnd(9)} ${r.file.padEnd(26)} ${r.method.padEnd(18)} ` +
      `${String(r.sizeOrig).padStart(9)} B -> .dat ${String(r.sizeDat).padStart(9)} B | byte berubah ${r.changedPct}%`
  );
}
console.log("=".repeat(100));
console.log(allOk ? "SEMUA LULUS: SHA-256 asli == SHA-256 hasil dekripsi, ekstensi pulih." : "ADA YANG GAGAL, lihat baris GAGAL di atas.");

// ---------- keluaran untuk laporan ----------
writeFileSync(join(outDir, "qa_results.json"), JSON.stringify(rows, null, 2));

let md = "# Hasil QA 5 Media\n\n";
md += `Kunci Extended Vigenere: \`${VIG_KEY}\` | Kunci transposisi: \`${TRANS_KEY}\`\n\n`;
md += "| No | Media | Berkas | Metode | Ukuran asli (B) | Ukuran .dat (B) | Byte berubah | Ekstensi pulih | SHA-256 asli = dekripsi | Status |\n";
md += "|---:|---|---|---|---:|---:|---:|---|---|---|\n";
rows.forEach((r, i) => {
  md += `| ${i + 1} | ${r.media} | ${r.file} | ${r.method} | ${r.sizeOrig} | ${r.sizeDat} | ${r.changedPct}% | .${r.extRestored} | ${r.identical ? "Ya" : "TIDAK"} | ${r.identical ? "Berhasil" : "Gagal"} |\n`;
});
md += "\n## Header (16 byte pertama): asli vs terenkripsi\n\n";
md += "| Berkas | Metode | Header asli (hex) | Header terenkripsi (hex) |\n|---|---|---|---|\n";
for (const r of rows) md += `| ${r.file} | ${r.method} | \`${r.headerOrig}\` | \`${r.headerEnc}\` |\n`;
md += "\n## Hash SHA-256\n\n";
md += "| Berkas | Metode | SHA-256 asli | SHA-256 hasil dekripsi |\n|---|---|---|---|\n";
for (const r of rows) md += `| ${r.file} | ${r.method} | \`${r.hashOrig}\` | \`${r.hashDec}\` |\n`;
writeFileSync(join(outDir, "qa_results.md"), md);

console.log(`\nKeluaran: ${join(outDir, "qa_results.md")} dan qa_results.json`);
process.exit(allOk ? 0 : 1);
