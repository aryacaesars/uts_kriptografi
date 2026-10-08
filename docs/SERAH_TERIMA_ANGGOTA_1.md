# Serah terima Anggota 1

Ruang lingkup: GUI web, sanitizer, Vigenere Standard, Auto-Key Vigenere, Affine, helper Base64, integrasi modul yang sudah tersedia, dan bahan laporan bagian Anggota 1. Peran mengikuti instruksi pengguna dan kontrak resmi. Nama pada catatan teknis tidak konsisten dengan matriks pembagian; identitas penyusun laporan perlu dikonfirmasi kelompok sebelum digabungkan.

## Lokasi pekerjaan

| Berkas | Fungsi |
| --- | --- |
| `app/page.tsx`, `app/layout.tsx` | Entrypoint Next.js dan metadata |
| `components/CipherWorkbench.jsx`, `app/globals.css` | GUI responsif, tema terang/gelap, form dinamis, upload/download |
| `src/modules/sanitizer.js` | `sanitizeText`, validasi kunci alfabet |
| `src/modules/vigenere_standard.js` | `encryptVigenereStandard`, `decryptVigenereStandard` |
| `src/modules/autokey_vigenere.js` | `encryptAutoKeyVigenere`, `decryptAutoKeyVigenere` |
| `src/modules/affine_cipher.js` | `encryptAffine`, `decryptAffine`, invers modulo |
| `src/modules/display_helpers.js` | Base64 UTF-8/byte dan format teks layar |
| `src/lib/workbench.js` | Penghubung form, cipher, dan kontainer KRIP |
| `tests/ciphers.test.mjs`, `tests/browser-smoke.mjs` | Uji logika/integrasi dan browser |
| `docs/bukti/` | Screenshot asli browser, hasil JSON, dan unduhan uji sintetis |
| `docs/LAPORAN_ANGGOTA_1.*` | Materi laporan bagian Anggota 1 |

Bahan asli `../src` tidak diubah. Modul Anggota 2 disalin dari bahan tersebut; atribusi penulis di sumber dipertahankan. Perbaikan integrasi dilakukan di proyek ini. Paket lock sudah memiliki perubahan sebelum pengerjaan dan tidak ditimpa.

## Untuk Anggota 2

Playfair, Extended Vigenere, Super Enkripsi, Enigma, dan kontainer KRIP dari bahan telah dihubungkan. Tinjau kembali modul milik Anda, lalu serahkan penjelasan teknis kepada penyusun laporan. Perhatikan batasan berikut:

- Playfair menyatukan I/J dan mempertahankan padding X/Z; dekripsi bukan pemulihan ejaan asli secara unik.
- Kontainer menyimpan ekstensi dan payload saja, tidak menyimpan algoritma/kunci/checksum. Algoritma dan kunci harus dipilih sama saat dekripsi. Status selesai berarti operasi selesai, bukan pembuktian kunci benar.
- Input alfabet memakai sanitizer bersama. File alfabet menjadi teks bersih `.txt`, sehingga pemulihan struktur CSV/JSON/HTML atau tanda baca tidak diklaim.
- Uji byte sintetis dan known-answer telah dijalankan, tetapi belum menggantikan pengujian lima media nyata serta pemeriksaan pembukaan di aplikasi asal.

## Hill Cipher (terintegrasi)

Modul dari `D:\Kuliah\SEMESTER_7\KRIPTOGRAFI\UTS\hill_cipper` sekarang disalin ke `src/modules/hill_cipher.js`, diekspor dan didaftarkan dalam `src/modules/index.js`, serta terhubung ke form matriks. Mendukung ordo 2?2 dan 3?3, invers modulo 26, validasi matriks langsung, dan padding X yang memang tetap terlihat setelah dekripsi.

Anggota 3 masih mengerjakan QA lima media nyata, tabel evaluasi sembilan butir, dan kompilasi laporan akhir. Bonus Ruby tidak dikerjakan karena stack memakai JavaScript/TypeScript.

## Bukti dan status

`npm test`: 14 kelompok uji, termasuk vektor Hill HELP?HIAT, ACT?POH, padding, dan matriks invalid. Browser: 13 pemeriksaan, termasuk enkripsi/dekripsi tiga cipher Anggota 1, Base64, clipboard, upload/download kelima cipher teks/byte yang diuji, tema, validasi Affine, dan viewport 390 px. Detail serta waktu eksekusi tersedia pada `bukti/browser-results.json` dan log verifikasi.

Screenshot berasal dari aplikasi yang dijalankan. File `contoh.txt` dan `sintetis.bin` dibuat otomatis oleh pengujian; jangan gunakan sebagai klaim bahwa lima media asli telah selesai diuji. Setelah perubahan program, regenerasi bukti agar tidak memakai screenshot atau log lama.

## Acuan yang dibaca

- `../Soal UTS Kriptografi 20261.pdf` (3 halaman; spesifikasi aplikasi dan laporan).
- `../breakdown tugas.txt` (pembagian peran; tabel centang di bahan merupakan rencana, bukan bukti).
- `../KONTRAK_INTERFACE_DAN_FUNGSI.txt` (acuan nama fungsi, tipe data, dan format KRIP; hasil unpack bernama `encryptedBytes`).
- `../CATATAN_DAN_PANDUAN_ANGGOTA_1.txt` (algoritma dan deliverable anggota 1).
- `../ALUR_KERJA_DAN_URUTAN_PENGERJAAN.txt` (dependensi Hill/QA/laporan).
- Panduan bawaan Next.js 16.4.0 di `node_modules/next/dist/docs/01-app/01-getting-started/` untuk layouts/pages, server/client components, dan CSS.

Naskah PDF menyebut deadline sesuai Classroom; tanggal 9 Oktober pada breakdown perlu dicocokkan dengan pengumuman kelas. Dokumen ini tidak menyatakan seluruh tugas kelompok sudah selesai.
