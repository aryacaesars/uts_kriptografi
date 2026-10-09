# Maskot Pixel Crypto Crew

Tiga karakter cowok fiktif, dibuat dengan built-in `image_gen`. Nama dan NPM ada di kartu web, bukan di dalam gambar.

| Anggota | NPM | Aset di `public/mascots/` | Gerakan |
| --- | --- | --- | --- |
| Dhiya Ulhaq Prima Yuga | 237006066 | `dhiya-sprite.png` | Hoodie biru, rambut hitam, melambaikan tangan |
| Andi Rafiyan | 237006074 | `andi-sprite.png` | Jaket varsity dan topi hijau, melompat ceria |
| Arya Achmad Caesar | 237006093 | `arya-sprite.png` | Hoodie ungu, kacamata, bergaya peace |

## Pemakaian

Sudah terpasang pada bagian anggota di `components/CipherWorkbench.jsx`, dengan CSS di `app/globals.css`.

Setiap PNG transparan berukuran 1254 x 1254, dengan empat frame dalam grid 2 x 2. Urutan: kiri atas, kanan atas, kiri bawah, kanan bawah. PNG merupakan sprite sheet; animasinya dijalankan oleh CSS pada web.

Untuk memasang kembali di bagian lain, gunakan kelas berikut dengan stylesheet aplikasi:

```html
<div class="pixel-animation mascot-dhiya" role="img" aria-label="Maskot Dhiya melambaikan tangan">
  <span class="mascot-sprite"></span>
</div>
```

Ganti `mascot-dhiya` dengan `mascot-andi` atau `mascot-arya`. CSS memakai `background-size: 200% 200%` dan keyframe `mascot-frames` dengan `steps(1, end)` supaya pose berpindah tanpa interpolasi. Durasi Dhiya 1,8 detik, Andi 1,2 detik, Arya 2 detik. `prefers-reduced-motion: reduce` menampilkan pose pertama tanpa animasi.

## Prompt set

Spesifikasi bersama: transparent PNG pixel-art animation sprite sheet; square canvas; four frames in a strict 2 by 2 equal cell grid; reading order top-left, top-right, bottom-left, bottom-right. Same complete full-body cute young adult male chibi game character in every cell. Same scale, centered in each cell, consistent baseline with room for motion, no overlap. Chunky square pixel art, dark outlines, limited palette, crisp edges, no smoothing or gradients. No text, labels, grid lines, borders, scenery, floor or shadow.

- Dhiya: short tousled black hair, medium warm tan skin, blue hoodie, dark navy trousers, white sneakers. Front slight three-quarter view. Friendly right-hand wave: arm low; elbow bent with hand at head level; hand raised outward; hand back at head level.
- Andi: medium tan skin, short brown hair, green varsity jacket over cream shirt, dark pants, cream sneakers, green baseball cap backwards. Front view. Happy idle bounce: standing with arms down; knees bent and elbows out; little jump with arms up; landing with knees bent.
- Arya: warm tan skin, side-parted black hair, black rectangular glasses, purple hoodie, charcoal pants, purple-white sneakers. Front three-quarter view. Celebratory groove: left hand on hip and right hand low; tilt left with hand lifted; tilt right with V peace sign; hand at shoulder returning neutral.

## Animasi lari di judul

Versi lari tambahan berada di `public/mascots/dhiya-run-sprite.png`, `andi-run-sprite.png`, dan `arya-run-sprite.png`. Dibuat dengan built-in `image_gen`, memakai sprite lama masing-masing sebagai referensi agar karakter dan pakaian tetap konsisten.

Ketiganya tampil berjajar di kanan judul ENKRIPSI & DEKRIPSI. Pada layar sampai 760px, maskot turun ke baris berikutnya. Pose berganti setiap 0,13–0,17 detik dengan ayunan posisi kecil. Pengaturan reduced motion menghentikan kedua animasi. Animasi kartu anggota tetap memakai sprite sebelumnya.

Prompt yang digunakan untuk ketiga referensi:

> Edit the supplied mascot sprite sheet into a NEW RUNNING animation sheet. Preserve the exact same male character identity, hairstyle, clothing, colors, chibi proportions and pixel-art style. Output square transparent PNG, FOUR frames in strict 2x2 equal-sized grid, reading order top-left top-right bottom-left bottom-right. Every frame shows this SAME full-body character RUNNING TO THE RIGHT in side / slight three-quarter profile, pumping bent arms and alternating legs. Frame 1 right leg extended forward left leg back; frame 2 feet passing under body; frame 3 left leg extended forward right leg back; frame 4 feet passing with opposite knee raised. A seamless four-pose run loop. Uniform character scale and center point in every cell, consistent foot baseline apart from subtle bounce, ample transparent padding, no overlap across grid cells. Figure fills about 70 percent of cell height. Crisp chunky square pixels, dark outlines, no smooth gradients. No text, grid lines, labels, borders, background, shadows, floor or unrelated objects. Preserve actual transparent alpha.

## Verifikasi

- `npm run lint` dan `npm run build` lulus.
- Halaman `/` dan ketiga URL `/mascots/*-sprite.png` merespons HTTP 200 pada server produksi lokal.
- Sprite diperiksa secara visual sebagai grid empat pose dengan tiga desain berbeda.
- Preview browser belum diverifikasi: Chrome headless gagal diluncurkan karena izin proses Windows (`Access is denied`).
