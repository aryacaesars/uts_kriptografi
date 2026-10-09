# Hasil QA 5 Media

Kunci Extended Vigenere: `KRIPTOGRAFI2026` | Kunci transposisi: `UNSIL`

| No | Media | Berkas | Metode | Ukuran asli (B) | Ukuran .dat (B) | Byte berubah | Ekstensi pulih | SHA-256 asli = dekripsi | Status |
|---:|---|---|---|---:|---:|---:|---|---|---|
| 1 | Audio | audio_awas_ombak.mp3 | Extended Vigenere | 166180 | 166188 | 100.00% | .mp3 | Ya | Berhasil |
| 2 | Audio | audio_awas_ombak.mp3 | Super Enkripsi | 166180 | 166188 | 99.61% | .mp3 | Ya | Berhasil |
| 3 | Database | database_toko.db | Extended Vigenere | 12288 | 12295 | 100.00% | .db | Ya | Berhasil |
| 4 | Database | database_toko.db | Super Enkripsi | 12288 | 12295 | 99.96% | .db | Ya | Berhasil |
| 5 | Dokumen | dokumen_laporan_tugas2.pdf | Extended Vigenere | 588019 | 588027 | 100.00% | .pdf | Ya | Berhasil |
| 6 | Dokumen | dokumen_laporan_tugas2.pdf | Super Enkripsi | 588019 | 588027 | 99.61% | .pdf | Ya | Berhasil |
| 7 | Gambar | gambar_pemandangan.jpg | Extended Vigenere | 340860 | 340868 | 100.00% | .jpg | Ya | Berhasil |
| 8 | Gambar | gambar_pemandangan.jpg | Super Enkripsi | 340860 | 340868 | 99.61% | .jpg | Ya | Berhasil |
| 9 | Video | video_drone.mp4 | Extended Vigenere | 1740200 | 1740208 | 100.00% | .mp4 | Ya | Berhasil |
| 10 | Video | video_drone.mp4 | Super Enkripsi | 1740200 | 1740208 | 99.62% | .mp4 | Ya | Berhasil |

## Header (16 byte pertama): asli vs terenkripsi

| Berkas | Metode | Header asli (hex) | Header terenkripsi (hex) |
|---|---|---|---|
| audio_awas_ombak.mp3 | Extended Vigenere | `49 44 33 04 00 00 00 00 08 35 54 58 58 58 00 00` | `94 96 7C 54 54 4F 47 52 49 7B 9D 8A 88 8A 36 4B` |
| audio_awas_ombak.mp3 | Super Enkripsi | `49 44 33 04 00 00 00 00 08 35 54 58 58 58 00 00` | `54 49 8A 50 AB A4 B9 95 32 53 B3 A5 85 99 32 B3` |
| database_toko.db | Extended Vigenere | `53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00` | `9E A3 95 B9 C8 B4 67 B8 B0 B8 B6 93 A4 52 69 4B` |
| database_toko.db | Super Enkripsi | `53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00` | `B9 B0 52 51 61 32 50 41 33 50 41 32 50 41 32 50` |
| dokumen_laporan_tugas2.pdf | Extended Vigenere | `25 50 44 46 2D 31 2E 34 0A 25 D3 EB E9 E1 0A 31` | `70 A2 8D 96 81 80 75 86 4B 6B 1C 1D 19 13 40 7C` |
| dokumen_laporan_tugas2.pdf | Super Enkripsi | `25 50 44 46 2D 31 2E 34 0A 25 D3 EB E9 E1 0A 31` | `96 4B 13 70 7D A6 9C A2 99 79 B0 A4 B9 87 68 B7` |
| gambar_pemandangan.jpg | Extended Vigenere | `FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01` | `4A 2A 48 30 54 5F 91 98 8A 8C 49 33 31 32 36 4C` |
| gambar_pemandangan.jpg | Super Enkripsi | `FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01` | `30 8A 32 50 19 82 9C 41 32 50 B3 8A 30 41 32 50` |
| video_drone.mp4 | Extended Vigenere | `00 00 00 24 66 74 79 70 69 73 6F 6D 00 00 02 00` | `4B 52 49 74 BA C3 C0 C2 AA B9 B8 9F 30 32 38 4B` |
| video_drone.mp4 | Super Enkripsi | `00 00 00 24 66 74 79 70 69 73 6F 6D 00 00 02 00` | `74 AA 32 BF 77 93 C0 46 A8 BD 41 32 50 41 33 50` |

## Hash SHA-256

| Berkas | Metode | SHA-256 asli | SHA-256 hasil dekripsi |
|---|---|---|---|
| audio_awas_ombak.mp3 | Extended Vigenere | `2c63c84aed8d698784c3bdd568075ce4b6c7ec528d740ee4133e7011a6682931` | `2c63c84aed8d698784c3bdd568075ce4b6c7ec528d740ee4133e7011a6682931` |
| audio_awas_ombak.mp3 | Super Enkripsi | `2c63c84aed8d698784c3bdd568075ce4b6c7ec528d740ee4133e7011a6682931` | `2c63c84aed8d698784c3bdd568075ce4b6c7ec528d740ee4133e7011a6682931` |
| database_toko.db | Extended Vigenere | `22ecf25f9e804f43777955c56bf04b4093f52456865814725bbc8468977fedc7` | `22ecf25f9e804f43777955c56bf04b4093f52456865814725bbc8468977fedc7` |
| database_toko.db | Super Enkripsi | `22ecf25f9e804f43777955c56bf04b4093f52456865814725bbc8468977fedc7` | `22ecf25f9e804f43777955c56bf04b4093f52456865814725bbc8468977fedc7` |
| dokumen_laporan_tugas2.pdf | Extended Vigenere | `7ba6c9af5e89e254c2128ba46e463f53a6bdd613751931f5f5d974ffeacc525e` | `7ba6c9af5e89e254c2128ba46e463f53a6bdd613751931f5f5d974ffeacc525e` |
| dokumen_laporan_tugas2.pdf | Super Enkripsi | `7ba6c9af5e89e254c2128ba46e463f53a6bdd613751931f5f5d974ffeacc525e` | `7ba6c9af5e89e254c2128ba46e463f53a6bdd613751931f5f5d974ffeacc525e` |
| gambar_pemandangan.jpg | Extended Vigenere | `10993d4ac75751adb488b51a08526d5a0214abda51539ab2632732d1c25fdce4` | `10993d4ac75751adb488b51a08526d5a0214abda51539ab2632732d1c25fdce4` |
| gambar_pemandangan.jpg | Super Enkripsi | `10993d4ac75751adb488b51a08526d5a0214abda51539ab2632732d1c25fdce4` | `10993d4ac75751adb488b51a08526d5a0214abda51539ab2632732d1c25fdce4` |
| video_drone.mp4 | Extended Vigenere | `4a1603b741f11e58a7bacfd2440ae7dea90e37a8141f65f8d07be0f3f3255c2b` | `4a1603b741f11e58a7bacfd2440ae7dea90e37a8141f65f8d07be0f3f3255c2b` |
| video_drone.mp4 | Super Enkripsi | `4a1603b741f11e58a7bacfd2440ae7dea90e37a8141f65f8d07be0f3f3255c2b` | `4a1603b741f11e58a7bacfd2440ae7dea90e37a8141f65f8d07be0f3f3255c2b` |
