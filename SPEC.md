# SPEC — Peta Interaktif Masjid Nabawi v3 (rebuild)

> Rebuild dari v2 (artifact `peta-interaktif-masjid-nabawi`) menjadi static site
> yang bersih, terorganisir, dan mudah dirawat. Semua konten berbahasa Indonesia.
> Repo ini HANYA berisi aset publik (denah resmi + foto-foto publik).
> DILARANG memasukkan data pribadi apa pun (tanpa kata "rombongan", tanpa
> tanggal perjalanan, tanpa nama orang, tanpa nomor kamar).

## 1. Tujuan

Membangun ulang Peta Interaktif Masjid Nabawi sebagai static site yang:

- strukturnya rapi dan terorganisir (HTML, CSS, JS, dan data terpisah),
- data titik (point) bersifat data-driven dari satu file data,
- mobile-first, karena dipakai jamaah dari HP sambil berdiri di masjid,
- aman dan proper untuk dibagikan ke jamaah lain (tidak ada data pribadi).

## 2. Sumber kebenaran

| Aset | Lokasi di repo | Keterangan |
|---|---|---|
| Denah dasar | `assets/map-base.jpg` | Render 300 dpi dari PDF resmi "Map of Al-Masjid An-Nabawi and Surrounding Courtyards" yang diunggah pengguna. **Jangan memakai denah lain.** Nomor pintu dan nama lokasi dibaca langsung dari PDF ini. |
| Foto lokasi | `assets/photos/` (13 foto + `manifest.json`) | Foto asli tiap lokasi, sudah diverifikasi satu per satu secara visual. Pakai apa adanya, jangan mencari foto pengganti dari web. `bab-jibril.jpg` mengandung watermark kecil IslamicLandmarks.com — biarkan, jangan di-crop. |
| Riset & koordinat | `docs/report.md` | Laporan riset asal (koordinat, deskripsi, rentang pintu). Koreksi pada bagian 6 dokumen ini **menggantikan** isi `docs/report.md` bila bertentangan. |

Design system "Baitullah": kertas hangat `#FAF6EF`, tinta `#14261C`,
hijau Nabawi `#0E5E43`, emas Ka'bah `#A8842C`, pasir `#E7DCC6`.
Maksimal 2 keluarga font (serif display + sans body). Rata kiri.
Tanpa gradasi, tanpa glassmorphism, tanpa emoji sebagai ikon,
tanpa label eyebrow.

## 3. Struktur repo (wajib)

```text
peta-masjid-nabawi/
├── index.html                 # satu-satunya halaman
├── SPEC.md                    # dokumen ini
├── README.md
├── docs/
│   └── report.md              # laporan riset asal (arsip)
└── assets/
    ├── map-base.jpg           # denah dasar (3000×2123)
    ├── photos/                # 13 foto terverifikasi + manifest.json
    │   ├── kubah-hijau.jpg
    │   ├── raudhah.jpg
    │   ├── bab-as-salam.jpg
    │   ├── bab-jibril.jpg
    │   ├── al-baqi.jpg
    │   ├── masjid-al-ghamama.jpg
    │   ├── masjid-abu-bakar.jpg
    │   ├── payung-courtyard.jpg
    │   ├── area-wanita.jpg
    │   ├── zamzam.jpg
    │   ├── perpustakaan.jpg
    │   ├── saqifah.jpg
    │   ├── kayan-hotel.jpg
    │   └── manifest.json
    ├── img/                   # gambar pendukung non-foto bila perlu (mis. og-image)
    ├── css/
    │   └── style.css          # seluruh styling, mobile-first
    └── js/
        ├── points.json        # SATU-SATUNYA sumber data titik (lihat bagian 4)
        └── app.js             # seluruh logika (render titik, bottom sheet,
                               # pencari pintu, filter, zoom/pan)
```

Aturan:

- `points.json` adalah satu-satunya sumber data titik. `app.js` dan
  `index.html` TIDAK BOLEH meng-hardcode daftar titik.
- Tidak ada framework berat. Vanilla HTML/CSS/JS saja (boleh library
  kecil untuk pinch-zoom bila perlu, tapi usahakan tanpa dependensi build).
- Tidak ada langkah build. Buka `index.html` langsung atau lewat static
  server mana pun harus jalan.

## 4. Data titik — 17 titik (wajib semua tampil)

Koordinat `x`/`y` dalam persen dari lebar/tinggi `assets/map-base.jpg`.
Setiap titik di `points.json` wajib punya field:
`id`, `nama`, `x`, `y`, `kategori`, `foto` (array, boleh lebih dari satu),
`deskripsi`, `tips`, `gerbang` (string, boleh kosong).

Kategori (6 zona) — dipakai untuk chip filter dan pengelompokan daftar:

1. `masjid-lama` — Masjid Lama & Raudhah
2. `gerbang` — Gerbang & Pintu
3. `pelataran` — Pelataran (payung)
4. `wanita` — Area Wanita
5. `fasilitas` — Fasilitas (Zamzam, Perpustakaan)
6. `sekitar` — Sekitar Masjid (Al-Ghamama, Abu Bakar, Saqifah, Kawasan Hotel)

| id | nama | x | y | kategori | foto | deskripsi | tips | gerbang |
|---|---|---|---|---|---|---|---|---|
| kubah | Kubah Hijau & Masjid Lama | 39 | 42 | masjid-lama | kubah-hijau.jpg, raudhah.jpg | Kubah Hijau menandai makam Rasulullah. Di bawahnya, antara mimbar dan rumah beliau, adalah Raudhah. | — | — |
| pintu-raudhah | Pintu Masuk Raudhah | 29.5 | 39.5 | masjid-lama | raudhah.jpg | Pintu masuk Raudhah untuk laki-laki dan perempuan, area gerbang 40–42. | Masuk Raudhah perlu izin (tasreh) lewat aplikasi Nusuk dan sesuai jadwal. | 40–42 |
| bab-as-salam | Bab As-Salam (Pintu Salam) | 38 | 24.5 | gerbang | bab-as-salam.jpg | Pintu 1. Jalur mengucap salam kepada Rasulullah: masuk dari sini, keluar lewat sisi Baqi'. | Jalur satu arah, ikuti arus jamaah. | 1 |
| bab-jibril | Bab Jibril | 15.5 | 37 | gerbang | bab-jibril.jpg | Pintu di sisi timur Masjid Lama, dekat Al-Baqi'. Dinamai dari Jibril yang pernah turun di sini. | — | Pintu Masjid Lama sisi timur |
| al-baqi | Pemakaman Al-Baqi' | 8 | 32 | sekitar | al-baqi.jpg | Pemakaman para sahabat dan keluarga Nabi, di sisi timur masjid. | Ziarah biasanya pagi setelah Subuh; perempuan tidak masuk area pemakaman. | — |
| al-ghamama | Masjid Al-Ghamama | 76 | 12 | sekitar | masjid-al-ghamama.jpg | Masjid kecil tempat Rasulullah pernah salat Istisqa. Di seberang Jalan As-Salam, barat masjid. | — | — |
| abu-bakar | Masjid Abu Bakar Ash-Shiddiq | 81.5 | 20.5 | sekitar | masjid-abu-bakar.jpg | Di sebelah Masjid Al-Ghamama, di lokasi rumah Abu Bakar. | — | — |
| payung-selatan | Pelataran Selatan | 47 | 22 | pelataran | payung-courtyard.jpg | Pelataran dengan payung raksasa (buka siang, tutup malam). | Perhatikan nomor pintu masuk agar mudah kembali ke titik yang sama. | 201–212, 301–312 |
| payung-utara | Pelataran Utara | 39 | 84 | pelataran | payung-courtyard.jpg | Sisi utara, menghadap King Fahd Road. | — | 219–230, 328–343 |
| payung-timur | Pelataran Timur | 10.5 | 70 | pelataran | payung-courtyard.jpg | Sisi timur, dekat Al-Baqi' dan King Abdulaziz Road. | — | 231–236, 344–354 |
| payung-barat | Pelataran Barat | 64.5 | 54 | pelataran | payung-courtyard.jpg | Sisi barat, dekat Jalan As-Salam. | — | 213–218, 314–327 |
| wanita-timur | Area Wanita — Timur | 25 | 65 | wanita | area-wanita.jpg | Area salat wanita sisi timur. | Pintu masuk wanita gerbang 32 (masjid lama) dan 25–27. | 25–27, 32 |
| wanita-barat | Area Wanita — Barat | 56.5 | 65 | wanita | area-wanita.jpg | Area salat wanita sisi barat. | Pintu masuk gerbang 13–17. | 13–17 |
| zamzam | Tempat Isi Air Zamzam | 67.5 | 15.5 | fasilitas | zamzam.jpg | Titik pengisian Zamzam di pelataran selatan (dekat gerbang 309). | Bawa botol kecil. Zamzam kemasan besar untuk dibawa pulang dibagikan lewat jalur resmi, jangan masukkan ke koper. | 309 |
| perpustakaan | Perpustakaan Masjid Nabawi | 58.5 | 62 | fasilitas | perpustakaan.jpg | Perpustakaan di sisi barat masjid (dekat gerbang 12–14). | **Foto lorong ini belum terverifikasi penuh, mohon cocokkan di lokasi.** | 12–14 |
| saqifah | Saqifah Bani Sa'idah | 82 | 76 | sekitar | saqifah.jpg | Taman tempat musyawarah pemilihan khalifah pertama. Arah **barat laut** dari masjid (sesuai kompas pada denah). | — | — |
| kawasan-hotel | Kawasan Hotel — Jalan As-Salam | 71 | 33 | sekitar | kayan-hotel.jpg | Kawasan hotel di Jalan As-Salam sisi barat, beberapa menit jalan kaki dari masjid. Titik ini penanda arah kawasan, **bukan** lokasi persis satu hotel. Foto hanya contoh fasad hotel di kawasan itu. | Catat nomor gerbang terdekat hotelmu sebagai patokan jalan pulang. | — |

## 5. Pencari nomor pintu (1–370)

Rentang berdasarkan legenda warna pada denah resmi (sudah dikoreksi):

- Selatan (hijau): 201–212, 301–312, 355–370
- Barat Daya (ungu): 309–313
- Barat (oranye): 213–218, 314–327
- Timur (biru): 231–236, **344–354**
- Utara (merah muda/merah): 219–230, 328–343
- Pintu 1–42: pintu-pintu Masjid Lama. Pintu 1 = Bab As-Salam.
  Pintu 40–42 = area Pintu Raudhah. Pintu 32 = pintu masuk wanita
  ke Masjid Lama.

Hasil pencarian menampilkan sisi + warna gerbang dan tombol
"Tunjukkan di denah" yang melompat ke titik terdekat di peta.

## 6. Koreksi penting — jangan sampai hilang di v3

1. **Pintu Timur = 344–354, BUKAN 341–354.** Nomor 341–343 tercetak
   merah di tepi bawah sisi utara denah (King Fahd Road) — jadi itu
   sisi utara, bukan timur. Jangan ada rentang yang tumpang tindih.
2. **Arah Saqifah = barat laut** (sesuai kompas pada denah itu sendiri),
   bukan barat daya.
3. **Foto perpustakaan belum terverifikasi penuh** — panel titik
   perpustakaan WAJIB menampilkan catatan itu.
4. **Tanpa data pribadi.** Titik hotel memakai nama umum
   "Kawasan Hotel — Jalan As-Salam". Jangan tulis nama hotel rombongan,
   tanggal perjalanan, atau kata "rombongan Anda" di mana pun.
5. Denah di peta memakai orientasi asli PDF: selatan/kiblat di atas.
   Beri peringatan arah yang jelas di halaman agar pengguna tidak bingung.

## 7. Perilaku mobile-first (pertahankan dari v2)

- Denah tampil full-bleed, tinggi sekitar 74vh.
- Pinch-zoom + geser (pan) pada denah, plus tombol reset tampilan.
- Penanda bernomor (1–17) yang bisa diketik; nomor penanda sama dengan
  nomor pada daftar lokasi.
- Ketuk penanda → bottom sheet berisi foto (bisa diperbesar layar penuh),
  nama, deskripsi, tips, dan info gerbang. Bottom sheet bisa digeser ke
  bawah untuk menutup. Latar terkunci (tidak bisa di-scroll) saat panel
  atau foto terbuka.
- Pencari nomor pintu tepat di bawah judul.
- Chip filter kategori dalam satu baris yang bisa digeser (swipeable);
  filter yang aktif meredupkan penanda lain.
- Navigasi cepat 3 tombol besar di bawah judul: Cari Pintu / Peta /
  Daftar Lokasi. Baris navigasi HARUS berada di dalam alur halaman
  (bukan `position: fixed`) — di v2 sempat ada bug bilah fixed yang
  menutupi penanda peta.
- Semua target sentuh minimal 44px (tombol utama 52px ke atas).
- Tombol ukuran huruf Normal/Besar (untuk jamaah sepuh).
- Daftar lokasi bernomor, dikelompokkan per kategori (bagian 4).
- Seksi "Tips singkat untuk jamaah": titik kumpul, catat nomor gerbang
  hotel, izin Nusuk untuk Raudhah, simpan halaman ke layar utama.
- Metadata pratinjau tautan (Open Graph: judul + deskripsi + foto
  Kubah Hijau) agar link yang diteruskan tampil rapi.

## 8. Quality gate (semua harus lolos sebelum dianggap selesai)

- [ ] 17 titik tampil di peta, sesuai koordinat bagian 4.
- [ ] Semua 13 foto termuat (tidak ada gambar rusak).
- [ ] Pencari pintu berfungsi untuk nomor 1–370, termasuk 1, 32, 309, 338, 344.
- [ ] Filter kategori berfungsi; daftar lokasi lengkap dan bernomor sama dengan penanda.
- [ ] Tanpa console error.
- [ ] Tanpa horizontal overflow pada lebar 390px.
- [ ] Bottom sheet bisa dibuka, digeser tutup, dan tidak menutupi penanda lain saat tertutup.
- [ ] Tidak ada satu pun kata/frasa data pribadi di seluruh halaman
      (cek: "rombongan", tanggal perjalanan, nama orang).
- [ ] Halaman jalan hanya dengan membuka `index.html` / static server,
      tanpa langkah build.

## 9. Output

Static site di repo ini, branch **`v3-organized`**. Tidak ada build step,
tidak ada backend. Setelah quality gate lolos, beri tahu pengguna agar
bisa di-deploy (mis. GitHub Pages / Vercel) atau dibungkus kembali
sebagai artifact.
