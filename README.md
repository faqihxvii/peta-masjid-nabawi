# Peta Interaktif Masjid Nabawi

Peta interaktif denah Masjid Nabawi (Madinah) yang bisa diklik: ketuk
sebuah titik di denah untuk melihat foto asli lokasi tersebut, penjelasan
singkat, dan info pintu. Dilengkapi pencari nomor pintu (1–370), filter
kategori, dan daftar lokasi. Dibuat mobile-first untuk jamaah yang
membukanya dari HP di lokasi.

## Isi

- **17 titik lokasi**: Kubah Hijau & Raudhah, Pintu Raudhah, Bab As-Salam,
  Bab Jibril, Al-Baqi', 4 pelataran payung, 2 area wanita, titik isi
  Zamzam, Perpustakaan, Masjid Al-Ghamama, Masjid Abu Bakar, Saqifah
  Bani Sa'idah, dan penanda arah Kawasan Hotel (Jalan As-Salam).
- **Pencari nomor pintu**: ketik nomor 1–370, ketahuan sisi masjidnya
  (Selatan/Barat/Timur/Utara) dan bisa langsung melompat ke titik
  terdekat di denah.

## Cara menjalankan

Tidak ada build step. Pilih salah satu:

```bash
# 1. Buka langsung di browser
open index.html

# 2. Atau lewat static server (disarankan)
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur

```text
├── index.html          # satu-satunya halaman
├── SPEC.md             # spesifikasi rebuild v3 (baca ini dulu)
├── docs/report.md      # laporan riset asal (arsip)
└── assets/
    ├── map-base.jpg    # denah dasar
    ├── photos/         # 13 foto terverifikasi + manifest.json
    ├── img/            # gambar pendukung non-foto
    ├── css/style.css
    └── js/
        ├── points.json # satu-satunya sumber data 17 titik
        └── app.js      # logika peta, bottom sheet, pencari pintu
```

## Sumber

- **Denah**: PDF resmi "Map of Al-Masjid An-Nabawi and Surrounding
  Courtyards" (`assets/map-base.jpg`, render 300 dpi dari PDF tersebut).
- **Foto**: foto-foto publik tiap lokasi, diverifikasi satu per satu
  secara visual — sumber tiap foto tercatat di
  `assets/photos/manifest.json`. Satu pengecualian: foto lorong
  Perpustakaan Masjid Nabawi belum terverifikasi penuh, dan hal itu
  ditulis jelas di panel lokasinya.

## Catatan

Repo ini hanya berisi aset publik. Tidak ada data pribadi, jadwal
perjalanan, atau nama rombongan di dalamnya — peta ini aman dibagikan
ke jamaah lain.
