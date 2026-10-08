# KriptoLab — UTS Kriptografi

Aplikasi Next.js untuk bagian Anggota 1: GUI, sanitizer, Vigenere Standard, Auto-Key Vigenere, Affine, dan integrasi bahan modul Anggota 2. Semua pemrosesan pesan dan file berjalan di browser.

## Menjalankan

Gunakan Node.js 22 LTS dan npm. Dari folder proyek ini:

```powershell
npm ci
npm run dev
```

Buka http://localhost:3000. Untuk versi produksi:

```powershell
npm run build
npm run start
```

## Menggunakan aplikasi

1. Pilih algoritma dan operasi Enkripsi/Dekripsi.
2. Isi kunci. Affine memakai a dan b; Super juga memakai kunci/jumlah kolom; Enigma memakai konfigurasi rotor.
3. Ketik pesan atau unggah file. Cipher alfabet menerima teks UTF-8 dan membuang selain A-Z; Extended/Super menerima file sembarang sampai 10 MiB.
4. Proses pesan. Hasil dapat ditampilkan kapital, kecil, atau Base64 sesuai jenis data. Base64 mempertahankan kapitalisasi aslinya karena peka huruf besar/kecil.
5. Salin atau unduh hasil. Enkripsi mengunduh kontainer `.dat` dengan metadata ekstensi. Untuk memulihkan file, pilih algoritma/kunci yang sama, Dekripsi, Unggah berkas, lalu pilih `.dat`.
6. Untuk hasil salinan Base64, gunakan Teks langsung dan encoding Base64. Salinan merupakan payload, sedangkan unduhan `.dat` mengandung header KRIP.

Tombol Balikkan proses memindahkan payload hasil ke input teks. Untuk mempertahankan ekstensi file biner, gunakan alur unduh/upload `.dat`. Teks alfabet pulih sebagai teks tersanitasi `.txt`; pemulihan byte file asli berlaku untuk Extended/Super.

## Verifikasi

```powershell
npm test
npm run lint
npm run build
```

Uji browser opsional membutuhkan Playwright, Chromium, dan server yang berjalan:

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run start -- --hostname 127.0.0.1 --port 3100
# Terminal kedua:
npm run test:browser
```

Jika Playwright sudah tersedia di lokasi lain, isi `$env:PLAYWRIGHT_MODULE` dengan path folder modulnya. Isi `$env:APP_URL` bila server memakai alamat/port lain. Browser test menghasilkan screenshot, hasil JSON, dan file uji sintetis di `docs/bukti/`. `npm test` memakai test runner bawaan Node tanpa proses anak agar berjalan dalam sandbox Windows.

## Status dan serah terima

Seluruh delapan algoritma pada selector telah terhubung, termasuk Hill Cipher ordo 2?2 dan 3?3. Matriks divalidasi langsung; padding X tetap tampak setelah dekripsi. [Panduan serah terima](docs/SERAH_TERIMA_ANGGOTA_1.md) memuat pekerjaan QA dan laporan kelompok yang tersisa.

[Laporan bagian Anggota 1](docs/LAPORAN_ANGGOTA_1.pdf), versi DOCX/Markdown, serta screenshot disimpan dalam `docs/`. Laporan ini bukan laporan final kelompok. QA lima media nyata dan kompilasi akhir menjadi pekerjaan Anggota 3 sesuai pembagian.

Kontainer KRIP mengikuti kontrak: `KRIP + panjang ekstensi (1 byte) + ekstensi ASCII + payload`. Algoritma dan kunci tidak disimpan; kunci keliru tidak dapat dideteksi otomatis. Playfair mempertahankan sisipan X/Z. Berkas tanpa ekstensi menggunakan `.bin`.

Bahan awal berasal dari `../src`; sumber asli tidak diubah. Dependensi runtime baru tidak ditambahkan. Identitas pada dokumen pembagian perlu diselaraskan oleh kelompok sebelum penyerahan.
# uts_kriptografi
