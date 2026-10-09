# KriptoLab — UTS Kriptografi

Aplikasi web kriptografi klasik dan modern (Next.js 16). Seluruh pemrosesan pesan dan berkas berjalan di browser, tidak ada data yang dikirim ke server.

Program Studi Informatika, Universitas Siliwangi. Dosen pengampu: Ir. Randi Rizal, Ph.D.

- Web: https://uts-kriptografi-snowy.vercel.app/
- Repositori: https://github.com/aryacaesars/uts_kriptografi.git

| Anggota | NPM | Peran |
|---|---|---|
| Dhiya Ulhaq Prima Yuga | 237006066 | Hill Cipher, QA lima media nyata, laporan, README |
| Andi Rafiyan | 237006074 | Playfair, Extended Vigenere, Super Enkripsi, Enigma M3, kontainer `.dat` |
| Arya Achmad Caesar | 237006093 | Web UI, sanitizer, Vigenere, Auto-Key, Affine, Base64 |

## Fitur

| No | Algoritma | Jenis data |
|---|---|---|
| 1 | Vigenere Cipher standard | Teks 26 huruf |
| 2 | Auto-Key Vigenere Cipher | Teks 26 huruf |
| 3 | Extended Vigenere Cipher | Byte (modulo 256), berkas sembarang |
| 4 | Playfair Cipher | Teks 26 huruf (matriks 5x5) |
| 5 | Affine Cipher | Teks 26 huruf |
| 6 | Hill Cipher | Teks 26 huruf, matriks 2x2 atau 3x3 |
| 7 | Super Enkripsi (Extended Vigenere + Transposisi Kolom) | Byte, berkas sembarang |
| 8 | Bonus: Enigma M3 | Teks 26 huruf |

Aturan umum: cipher 26 huruf hanya memproses A-Z (spasi, angka, tanda baca dibuang, hasil tanpa spasi). Hasil dapat ditampilkan sebagai teks atau Base64. Berkas dibaca sebagai byte mentah termasuk header, sehingga berkas terenkripsi tidak bisa dibuka aplikasi aslinya. Hasil enkripsi berkas disimpan sebagai `.dat` dengan header `KRIP` + panjang ekstensi (1 byte) + ekstensi ASCII + payload, sehingga ekstensi asli pulih otomatis saat dekripsi.

## Menjalankan aplikasi

Prasyarat: Node.js 22 LTS dan npm.

```bash
npm ci
npm run dev        # buka http://localhost:3000
```

Versi produksi: `npm run build` lalu `npm run start`.

## Menggunakan aplikasi

1. Pilih algoritma dan operasi Enkripsi atau Dekripsi.
2. Isi kunci. Affine memakai a dan b; Super juga memakai kunci kolom; Enigma memakai konfigurasi rotor; Hill memakai matriks (contoh `3 3; 2 5`).
3. Ketik pesan atau unggah berkas (Extended/Super menerima berkas sembarang sampai 10 MiB).
4. Proses pesan, lalu salin atau unduh hasil. Enkripsi berkas mengunduh `.dat`. Untuk memulihkan: pilih algoritma dan kunci yang sama, Dekripsi, Unggah berkas, pilih `.dat`.

## Hill Cipher

Kunci berupa matriks persegi 2x2 atau 3x3. Matriks valid jika `gcd(det(K) mod 26, 26) = 1`; validasi tampil langsung di UI. Jika panjang teks bukan kelipatan ordo, ditambahkan padding `X` yang tetap terlihat setelah dekripsi.

| Kunci | Plainteks | Cipherteks |
|---|---|---|
| `3 3; 2 5` | `HELP` | `HIAT` |
| `6 24 1; 13 16 10; 20 17 15` | `ACT` | `POH` |
| `2 4; 1 2` | - | Ditolak (det = 0) |

## Pengujian

```bash
npm test           # 14 kelompok uji unit semua cipher
npm run lint
```

### QA lima media nyata

Skrip `qa_media_test.js` mengenkripsi dan mendekripsi berkas nyata (dokumen, gambar, basis data, audio, video) dengan Extended Vigenere dan Super Enkripsi, lalu membandingkan SHA-256 berkas asli dengan hasil dekripsi.

```bash
node qa_media_test.js <folder_berkas_uji> --engine ./src/modules/index.js --out ./qa_output
```

Opsi: `--key` (kunci Vigenere, default `KRIPTOGRAFI2026`) dan `--tkey` (kunci transposisi, default `UNSIL`). Keluaran: `*_encrypted.dat`, `*_decrypted.<ext>`, `qa_results.md`, `qa_results.json`. Status keluar 0 bila semua berkas pulih dengan SHA-256 identik.

Hasil pada PDF 588.019 B, JPG 340.860 B, SQLite 12.288 B, MP3 166.180 B, dan MP4 1.740.200 B: seluruh 10 skenario lulus. Ringkasan dan bukti tangkapan layar ada di `docs/bukti_qa/`.

### Uji browser (opsional)

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run start -- --hostname 127.0.0.1 --port 3100
npm run test:browser   # terminal kedua
```

## Struktur

- `app/`, `components/`: UI Next.js (App Router)
- `src/modules/`: seluruh cipher, `file_container.js`, `display_helpers.js`
- `tests/`: `ciphers.test.mjs`, `browser-smoke.mjs`
- `qa_media_test.js`: skrip QA media nyata
- `docs/`: laporan, serah terima, bukti tangkapan layar (`bukti/`, `bukti_qa/`)

Catatan: kunci keliru saat dekripsi tidak dapat dideteksi otomatis. Berkas tanpa ekstensi memakai `.bin`.
