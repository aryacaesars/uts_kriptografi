"use client";

import { useEffect, useState } from "react";
import { ALGORITHMS, maxInputBytes, hillAvailable, isBinary, processRequest } from "../src/lib/workbench.js";
import { base64ToBytes, bytesToBase64, modInverse, sanitizeText, validateHillMatrix } from "../src/modules/index.js";

function Icon({ name, size = 20 }) {
  const paths = {
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"/><path d="M8 13h8M8 17h5"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/>,
    code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    swap: <><path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.lock}</svg>;
}

const encoder = new TextEncoder();
const PREVIEW_LIMIT = 12000;
function parseMatrix(value) {
  const rows = value.trim().split(/[;\n]+/).filter(Boolean).map(row => row.trim().split(/[\s,]+/).map(Number));
  if (![2, 3].includes(rows.length) || rows.some(row => row.length !== rows.length || row.some(n => !Number.isSafeInteger(n)))) throw new Error("Matriks harus 2×2 atau 3×3 berisi bilangan bulat. Pisahkan baris dengan titik koma.");
  return rows;
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [algorithm, setAlgorithm] = useState("vigenere");
  const [operation, setOperation] = useState("encrypt");
  const [source, setSource] = useState("text");
  const [input, setInput] = useState("KRIPTOGRAFI UNSIL");
  const [inputEncoding, setInputEncoding] = useState("text");
  const [key, setKey] = useState("BAGUS");
  const [a, setA] = useState("7");
  const [b, setB] = useState("10");
  const [columnType, setColumnType] = useState("word");
  const [columnKey, setColumnKey] = useState("KUNCI");
  const [matrix, setMatrix] = useState("3 3; 2 5");
  const [rotors, setRotors] = useState(["I", "II", "III"]);
  const [reflector, setReflector] = useState("B");
  const [positions, setPositions] = useState("AAA");
  const [rings, setRings] = useState("AAA");
  const [plugboard, setPlugboard] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [outputMode, setOutputMode] = useState("text");
  const [inputPreviewMode, setInputPreviewMode] = useState("base64");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = ALGORITHMS.find(item => item.id === algorithm);
  const binary = isBinary(algorithm);
  const pending = algorithm === "hill" && !hillAvailable();
  let hillStatus = null;
  if (algorithm === "hill" && !pending) {
    try { hillStatus = validateHillMatrix(parseMatrix(matrix)); }
    catch (err) { hillStatus = { isValid: false, message: err.message }; }
  }
  const hillInvalid = algorithm === "hill" && hillStatus !== null && !hillStatus.isValid;

  useEffect(() => {
    // Read browser preference after hydration; server rendering uses the light default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setTheme(localStorage.getItem("kriptolab-theme") === "dark" ? "dark" : "light"); } catch { /* Theme works without storage. */ }
  }, []);

  function change(setter, value) { setter(value); setResult(null); setError(""); setNotice(""); }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("kriptolab-theme", next); } catch { /* Optional persistence. */ }
  }

  async function run(event) {
    event.preventDefault(); setError(""); setNotice(""); setResult(null); setBusy(true);
    try {
      if (source === "file" && !file) throw new Error("Pilih berkas terlebih dahulu.");
      if (source === "file" && file.size > maxInputBytes(operation, file.name)) throw new Error("Batas ukuran berkas adalah 10 MiB (di luar header kontainer).");
      const bytes = source === "file" ? new Uint8Array(await file.arrayBuffer()) : inputEncoding === "base64" ? base64ToBytes(input) : encoder.encode(input);
      const start = performance.now();
      if (algorithm === "affine" && (a.trim() === "" || b.trim() === "")) throw new Error("Isi kedua parameter a dan b.");
      const next = processRequest({
        algorithm, operation, inputBytes: bytes, fileName: source === "file" ? file.name : "",
        key, a: Number(a), b: Number(b), transpositionKey: columnType === "count" ? Number(columnKey) : columnKey,
        matrixKey: algorithm === "hill" ? parseMatrix(matrix) : undefined,
        enigma: { rotors, reflector, positions: positions.toUpperCase(), rings: rings.toUpperCase(), plugboard: plugboard.trim().toUpperCase().split(/[\s,]+/).filter(Boolean) },
      });
      next.elapsed = (performance.now() - start).toFixed(2);
      next.base64 = bytesToBase64(next.bytes);
      next.inputBase64 = bytesToBase64(next.inputBytes);
      next.inputText = binary ? null : new TextDecoder().decode(next.inputBytes);
      setOutputMode(binary ? "base64" : "text"); setInputPreviewMode("base64"); setResult(next);
    } catch (err) { setError(err.message || "Pemrosesan gagal."); }
    finally { setBusy(false); }
  }

  const output = result ? outputMode === "base64" ? result.base64 : outputMode === "lowercase" ? result.text.toLowerCase() : result.text : "";
  const preview = result ? inputPreviewMode === "base64" ? result.inputBase64 : result.inputText || "" : "";

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); setNotice("Hasil lengkap berhasil disalin."); }
    catch { setError("Browser tidak mengizinkan clipboard. Pilih dan salin isi area hasil secara manual."); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([result.downloadBytes], { type: "application/octet-stream" }));
    const link = document.createElement("a"); link.href = url; link.download = result.downloadName; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Unduhan ${result.downloadName} dimulai.`);
  }
  function reuseResult() {
    setInput(binary ? result.base64 : result.text);
    setInputEncoding(binary ? "base64" : "text"); setSource("text"); setFile(null);
    setOperation(result.operation === "encrypt" ? "decrypt" : "encrypt");
    setResult(null); setError(""); setNotice("Hasil dipindahkan ke input. Kunci tetap sama.");
  }
  function example() {
    setSource("text"); setFile(null); setInputEncoding("text"); setOperation("encrypt");
    setInput(algorithm === "autokey" ? "TEKNIKINFORMATIKA" : algorithm === "affine" ? "UNIVERSITAS SILIWANGI" : algorithm === "enigma" ? "AAAAA" : "KRIPTOGRAFI UNSIL");
    setKey(algorithm === "autokey" ? "UNSIL" : "BAGUS"); setA("7"); setB("10");
    setRotors(["I", "II", "III"]); setReflector("B"); setPositions("AAA"); setRings("AAA"); setPlugboard("");
    setResult(null); setError(""); setNotice("");
  }

  return <div className="app-shell" data-theme={theme}>
    <header className="site-header">
      <a className="brand" href="#workspace" aria-label="KriptoLab beranda">kripto<span>lab</span><span className="brand-period">.</span></a>
      <div className="header-actions"><span className="course-label">UTS Kriptografi</span><button className="icon-button" type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}><Icon name={theme === "dark" ? "sun" : "moon"} size={18}/></button></div>
    </header>
    <main id="workspace">
      <div className="workspace-heading"><div><h1>Enkripsi & dekripsi</h1><p>Olah teks atau berkas dengan cipher pilihanmu.</p></div><a className="help-link" href="#panduan" onClick={() => { document.getElementById("panduan").open = true; }}>Cara penggunaan <span aria-hidden="true">&nearr;</span></a></div>
      <form onSubmit={run}>
        <fieldset className="workspace-fieldset" disabled={busy}>
          <div className="configuration">
            <div className="algorithm-field"><label className="field-label" htmlFor="algorithm">Algoritma</label><select id="algorithm" value={algorithm} onChange={e => change(setAlgorithm, e.target.value)}>{ALGORITHMS.map(item => <option key={item.id} value={item.id}>{item.name}{item.id === "hill" && !hillAvailable() ? " (belum tersedia)" : ""}</option>)}</select></div>
            <div className="operation-field"><span className="field-label">Operasi</span><div className="segmented" role="group" aria-label="Operasi"><button type="button" aria-pressed={operation === "encrypt"} className={operation === "encrypt" ? "selected" : ""} onClick={() => change(setOperation, "encrypt")}>Enkripsi</button><button type="button" aria-pressed={operation === "decrypt"} className={operation === "decrypt" ? "selected" : ""} onClick={() => change(setOperation, "decrypt")}>Dekripsi</button></div></div>
            <div className={`key-fields key-${algorithm}`}>
                {!["affine", "hill", "enigma"].includes(algorithm) && <><label className="field-label" htmlFor="key">{algorithm === "super" ? "Kunci Vigenere" : algorithm === "autokey" ? "Kunci awal" : "Kunci"}</label><input id="key" value={key} required autoComplete="off" spellCheck="false" onChange={e => change(setKey, e.target.value)}/><p className="hint">{binary ? "Kunci dikonversi ke UTF-8; spasi dan simbol dipertahankan." : `Kunci setelah sanitasi: ${sanitizeText(key) || "belum ada huruf A-Z"}`}</p></>}

                {algorithm === "affine" && <><div className="two-fields"><div><label className="field-label" htmlFor="affine-a">Pengali (a)</label><input id="affine-a" type="number" step="1" required value={a} onChange={e => change(setA, e.target.value)}/></div><div><label className="field-label" htmlFor="affine-b">Pergeseran (b)</label><input id="affine-b" type="number" min="0" max="25" step="1" required value={b} onChange={e => change(setB, e.target.value)}/></div></div><p className={a.trim() && modInverse(Number(a)) ? "hint success-text" : "hint warning-text"}>{a.trim() && modInverse(Number(a)) ? `Invers a modulo 26 = ${modInverse(Number(a))}` : "a harus relatif prima dengan 26."}</p><p className="hint">a: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25.</p></>}

                {algorithm === "super" && <><label className="field-label" htmlFor="column-type">Jenis kunci transposisi</label><select id="column-type" value={columnType} onChange={e => { change(setColumnType, e.target.value); setColumnKey(e.target.value === "count" ? "5" : "KUNCI"); }}><option value="word">Kata kunci kolom</option><option value="count">Jumlah kolom</option></select><label className="field-label" htmlFor="column-key">{columnType === "word" ? "Kata kunci" : "Jumlah kolom (2–1024)"}</label><input id="column-key" type={columnType === "count" ? "number" : "text"} min={2} max={1024} step={1} required value={columnKey} onChange={e => change(setColumnKey, e.target.value)}/></>}

                {algorithm === "hill" && <><label className="field-label" htmlFor="matrix">Matriks kunci</label><textarea id="matrix" rows={2} value={matrix} onChange={e => change(setMatrix, e.target.value)}/>{hillStatus && <p className={`hint ${hillStatus.isValid ? "success-text" : "warning-text"}`} role="status">{hillStatus.message}</p>}<p className="hint">Baris dipisah tanda titik koma. Misal: 3 3; 2 5. Hill menambahkan X bila blok terakhir tidak penuh; X tetap terlihat setelah dekripsi.</p>{pending && <div className="inline-warning">Modul Hill belum tersedia.</div>}</>}

                {algorithm === "enigma" && <><span className="field-label">Rotor (kiri → kanan)</span><div className="rotor-fields">{rotors.map((rotor, i) => <select key={i} aria-label={`Rotor ${["kiri", "tengah", "kanan"][i]}`} value={rotor} onChange={e => change(setRotors, rotors.map((v, j) => i === j ? e.target.value : v))}>{["I", "II", "III", "IV", "V"].map(v => <option key={v}>{v}</option>)}</select>)}</div><div className="two-fields"><div><label className="field-label" htmlFor="positions">Posisi awal</label><input id="positions" value={positions} maxLength={3} required onChange={e => change(setPositions, e.target.value.toUpperCase())}/></div><div><label className="field-label" htmlFor="rings">Ring</label><input id="rings" value={rings} maxLength={3} required onChange={e => change(setRings, e.target.value.toUpperCase())}/></div></div><label className="field-label" htmlFor="reflector">Reflektor</label><select id="reflector" value={reflector} onChange={e => change(setReflector, e.target.value)}><option>B</option><option>C</option></select><label className="field-label" htmlFor="plugboard">Plugboard (opsional)</label><input id="plugboard" value={plugboard} placeholder="AB CD EF" onChange={e => change(setPlugboard, e.target.value)}/><p className="hint">Maksimal 10 pasangan, setiap huruf hanya boleh digunakan sekali.</p></>}
            </div>
          </div>
          <div className="cipher-description"><span>{selected.family}</span><p>{selected.description}</p></div>
          <div className="editor-grid">
            <section className="editor-panel input-panel" aria-labelledby="input-title">
              <div className="panel-heading"><h2 id="input-title">{operation === "encrypt" ? "Pesan asli" : "Cipherteks"}</h2><button type="button" className="text-button" onClick={example}>Isi contoh</button></div>
              <div className="editor-toolbar"><div className="tabs" role="group" aria-label="Sumber input"><button type="button" aria-pressed={source === "text"} className={source === "text" ? "active-tab" : ""} onClick={() => change(setSource, "text")}>Teks langsung</button><button type="button" aria-pressed={source === "file"} className={source === "file" ? "active-tab" : ""} onClick={() => change(setSource, "file")}>Unggah berkas</button></div>{source === "text" && <select aria-label="Encoding input" className="small-select" value={inputEncoding} onChange={e => change(setInputEncoding, e.target.value)}><option value="text">Teks UTF-8</option><option value="base64">Base64</option></select>}</div>
              {source === "text" ? <><label className="sr-only" htmlFor="message">Isi pesan</label><textarea id="message" className="message-area" value={input} placeholder={operation === "encrypt" ? "Tulis pesan di sini..." : "Tempel cipherteks di sini..."} spellCheck="false" onChange={e => change(setInput, e.target.value)}/><div className="editor-meta"><span>{input.length.toLocaleString("id-ID")} karakter</span><span>{inputEncoding === "base64" ? "Base64" : "UTF-8"}</span></div></> : <div className="file-drop"><Icon name="file" size={24}/><strong>{file ? file.name : operation === "encrypt" ? "Pilih berkas untuk dienkripsi" : "Pilih berkas .dat"}</strong><p>{binary ? "Dokumen, gambar, database, audio, atau video." : "Gunakan berkas teks UTF-8."}</p><label className="sr-only" htmlFor="file-input">Pilih berkas</label><input id="file-input" type="file" accept={operation === "decrypt" ? ".dat" : binary ? undefined : ".txt,.md,.csv,.json,.xml,.html,.sql,.log"} onChange={e => change(setFile, e.target.files?.[0] || null)}/><small>{file ? `${file.size.toLocaleString("id-ID")} byte` : "Maksimal 10 MiB"}</small></div>}
              <div className="editor-bottom"><p className="input-note">{binary ? operation === "decrypt" && source === "text" ? "Pilih Base64 untuk cipherteks hasil salinan." : "Seluruh byte diproses, termasuk header berkas." : "Spasi, angka, dan tanda baca dibuang."}</p><button className="primary-button" type="submit" disabled={busy || pending || hillInvalid}>{busy ? "Memproses..." : operation === "encrypt" ? "Enkripsi pesan" : "Dekripsi pesan"}<Icon name="arrow" size={17}/></button></div>
            </section>
            <section className={`editor-panel result-panel ${result ? "has-result" : ""}`} aria-labelledby="result-title">
              <div className="panel-heading"><h2 id="result-title">Hasil {operation === "decrypt" ? "dekripsi" : "enkripsi"}</h2>{result && <span className="result-badge"><Icon name="check" size={14}/>Selesai</span>}</div>
              <div className="editor-toolbar"><select aria-label="Format hasil" className="small-select" value={outputMode} disabled={!result} onChange={e => setOutputMode(e.target.value)}>{(!result || result.text !== null) && <><option value="text">Teks kapital</option><option value="lowercase">Teks kecil</option></>}<option value="base64">Base64</option></select><button className="text-button" type="button" disabled={!result} onClick={() => copy(output)}><Icon name="copy" size={15}/>Salin hasil</button></div>
              <textarea aria-label="Hasil pemrosesan" className="output-area" readOnly value={output.slice(0, PREVIEW_LIMIT)} placeholder="Hasil pemrosesan akan muncul di sini." spellCheck="false"/>
              <div className="editor-meta"><span>{result ? `${result.bytes.length.toLocaleString("id-ID")} byte` : "Belum diproses"}</span><span>{result ? `${result.elapsed} ms` : ""}</span></div>
              <div className="editor-bottom result-bottom"><div className="file-result">{result ? <><strong>{result.downloadName}</strong>{output.length > PREVIEW_LIMIT && <small>Pratinjau 12.000 karakter; unduhan tetap lengkap.</small>}</> : <span>Gunakan kunci yang sama untuk dekripsi.</span>}</div><div className="result-actions"><button className="icon-button" type="button" aria-label="Balikkan proses" title="Balikkan proses" disabled={!result} onClick={reuseResult}><Icon name="swap" size={17}/></button><button className="secondary-button" type="button" disabled={!result} onClick={download}><Icon name="download" size={16}/>Unduh hasil</button></div></div>
            </section>
          </div>
        </fieldset>
      </form>
      {error && <div className="error-banner" role="alert">{error}</div>}
      {notice && <div className="notice-banner" role="status">{notice}</div>}
      {result && <>
            <details className="input-preview"><summary>Lihat pesan masukan dan Base64</summary><div className="result-toolbar"><span>{result.normalized ? `Sanitasi: ${result.normalized.slice(0, 100)}${result.normalized.length > 100 ? "…" : ""}` : `${result.inputBytes.length.toLocaleString("id-ID")} byte masukan`}</span><select className="small-select" aria-label="Format pratinjau input" value={inputPreviewMode} onChange={e => setInputPreviewMode(e.target.value)}><option value="base64">Base64</option>{result.inputText !== null && <option value="text">Teks asli</option>}</select></div><textarea aria-label="Pratinjau input" className="output-area" readOnly value={preview.slice(0, PREVIEW_LIMIT)}/><button className="text-button" type="button" onClick={() => copy(preview)}>Salin input lengkap</button></details>
      </>}
      <details className="usage-guide" id="panduan"><summary>Catatan penggunaan</summary><div className="guide-content"><p><strong>Teks alfabet.</strong> Hanya huruf A-Z diproses. Dekripsi mengembalikan teks yang telah disanitasi. Playfair menggabungkan I/J dan mempertahankan huruf sisipan.</p><p><strong>Berkas biner.</strong> Pilih Extended Vigenere atau Super. Unduh hasil .dat, lalu unggah kembali dengan operasi Dekripsi dan kunci yang sama untuk memulihkan ekstensi aslinya.</p><p><strong>Base64.</strong> Untuk memproses hasil salinan, pilih encoding input Base64. Salinan berisi payload; berkas .dat juga menyimpan metadata ekstensi.</p></div></details>
      <footer className="page-footer"><span>Universitas Siliwangi</span><span>Pesan dan kunci diproses di perangkat ini.</span></footer>
    </main>
  </div>;
}
