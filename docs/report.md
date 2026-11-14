# Research: Peta Interaktif Masjid Nabawi

Sumber denah: PDF resmi "Map of Al-Masjid An-Nabawi and Surrounding Courtyards"
yang diunggah pengguna (`workspace/user/files/masjid-nabawi-map.PDF`, 1 halaman,
dibuat dengan Adobe Illustrator). Gambar dasar yang harus dipakai:
`map-base.jpg` (render 300 dpi dari PDF itu, 3000×2123). JANGAN memakai
denah lain — nomor pintu dan nama lokasi di bawah ini dibaca langsung dari
PDF tersebut.

Foto: `photos/` berisi 13 foto yang sudah diverifikasi satu per satu
secara visual (lihat `photos/manifest.json` untuk sumber tiap foto).
Pakai foto-foto ini apa adanya — JANGAN mencari foto pengganti dari web.
Satu pengecualian: `perpustakaan.jpg` (lorong perpustakaan) tidak bisa
dipastikan 100% milik Perpustakaan Masjid Nabawi — tampilkan dengan
catatan "Foto lorong ini belum terverifikasi penuh, mohon cocokkan di lokasi".
`bab-jibril.jpg` mengandung watermark kecil IslamicLandmarks.com di pojok —
biarkan apa adanya, jangan di-crop.

## Titik-titik (koordinat dalam % dari lebar/tinggi map-base.jpg)

| id | nama | x | y | foto | keterangan singkat |
|---|---|---|---|---|---|
| kubah | Kubah Hijau & Masjid Lama | 39 | 42 | kubah-hijau.jpg, raudhah.jpg | Kubah Hijau menandai makam Rasulullah. Di bawahnya, antara mimbar dan rumah beliau, adalah Raudhah. |
| pintu-raudhah | Pintu Masuk Raudhah | 29.5 | 39.5 | raudhah.jpg | Pintu masuk Raudhah untuk laki-laki dan perempuan, area gerbang 40–42. Masuk Raudhah perlu izin (tasreh) lewat aplikasi Nusuk dan sesuai jadwal. |
| bab-as-salam | Bab As-Salam (Pintu Salam) | 38 | 24.5 | bab-as-salam.jpg | Pintu 1. Jalur mengucap salam kepada Rasulullah: masuk dari sini, keluar lewat sisi Baqi'. Jalur satu arah, ikuti arus jamaah. |
| bab-jibril | Bab Jibril | 15.5 | 37 | bab-jibril.jpg | Pintu di sisi timur Masjid Lama, dekat Al-Baqi'. Dinamai dari Jibril yang pernah turun di sini. |
| al-baqi | Pemakaman Al-Baqi' | 8 | 32 | al-baqi.jpg | Pemakaman para sahabat dan keluarga Nabi, di sisi timur masjid. Ziarah biasanya pagi setelah Subuh; perempuan tidak masuk area pemakaman. |
| al-ghamama | Masjid Al-Ghamama | 76 | 12 | masjid-al-ghamama.jpg | Masjid kecil tempat Rasulullah pernah salat Istisqa. Di seberang Jalan As-Salam, barat masjid. |
| abu-bakar | Masjid Abu Bakar Ash-Shiddiq | 81.5 | 20.5 | masjid-abu-bakar.jpg | Di sebelah Masjid Al-Ghamama, di lokasi rumah Abu Bakar. |
| payung-selatan | Pelataran Selatan | 47 | 22 | payung-courtyard.jpg | Pelataran dengan payung raksasa (buka siang, tutup malam). Pintu 201–212 dan 301–312. |
| payung-utara | Pelataran Utara | 39 | 84 | payung-courtyard.jpg | Sisi utara, menghadap King Fahd Road. Pintu 219–230 dan 328–343. |
| payung-timur | Pelataran Timur | 10.5 | 70 | payung-courtyard.jpg | Sisi timur, dekat Al-Baqi' dan King Abdulaziz Road. Pintu 231–236 dan 341–354. |
| payung-barat | Pelataran Barat | 64.5 | 54 | payung-courtyard.jpg | Sisi barat, dekat Jalan As-Salam. Pintu 213–218 dan 314–327. |
| wanita-timur | Area Wanita — Timur | 25 | 65 | area-wanita.jpg | Area salat wanita sisi timur. Pintu masuk wanita gerbang 32 (masjid lama) dan 25–27. |
| wanita-barat | Area Wanita — Barat | 56.5 | 65 | area-wanita.jpg | Area salat wanita sisi barat. Pintu masuk gerbang 13–17. |
| zamzam | Tempat Isi Air Zamzam | 67.5 | 15.5 | zamzam.jpg | Titik pengisian Zamzam di pelataran selatan (dekat gerbang 309). Bawa botol kecil. Zamzam kemasan besar untuk dibawa pulang dibagikan lewat jalur resmi, jangan masukkan ke koper. |
| perpustakaan | Perpustakaan Masjid Nabawi | 58.5 | 62 | perpustakaan.jpg | Perpustakaan di sisi barat masjid (dekat gerbang 12–14). FOTO BELUM TERVERIFIKASI PENUH — beri catatan itu di panel. |
| saqifah | Saqifah Bani Sa'idah | 82 | 76 | saqifah.jpg | Taman tempat musyawarah pemilihan khalifah pertama. Di barat daya, dekat pelataran barat. |
| kayan | Kawasan Hotel — Jalan As-Salam (arah) | 71 | 33 | kayan-hotel.jpg | Kawasan hotel di Jalan As-Salam sisi barat, beberapa menit jalan kaki dari masjid. Titik ini penanda arah kawasan, bukan lokasi persis satu hotel. |

## Pencari nomor pintu (berdasar legenda warna denah)

- Selatan (hijau): 201–212, 301–312, 355–370
- Barat Daya (ungu): 309–313
- Barat (oranye): 213–218, 314–327
- Timur (biru): 231–236, 341–354
- Utara (merah muda/merah): 219–230, 328–343
- Pintu 1–42: pintu-pintu Masjid Lama. Pintu 1 = Bab As-Salam. Pintu 40–42 = area Pintu Raudhah. Pintu 32 = pintu masuk wanita ke Masjid Lama.

## Desain

Ikuti design system "Baitullah" (workspace/umrah-pdf/DESIGN.md):
kertas hangat #FAF6EF, tinta #14261C, hijau Nabawi #0E5E43,
emas Ka'bah #A8842C, rata kiri, tanpa gradasi, tanpa emoji sebagai ikon,
tanpa label eyebrow. Bahasa Indonesia. Mobile-first: pengguna membuka
dari HP sambil berdiri di masjid — tombol besar, panel bawah yang mudah
ditutup, peta bisa di-zoom (pinch) dan digeser, tombol reset tampilan.
