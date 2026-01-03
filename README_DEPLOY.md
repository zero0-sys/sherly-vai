# Panduan Deployment ke Railway

Proyek ini telah diperbarui untuk mendukung deteksi pose anime VR real-time dengan fitur chat suara.

## Langkah-langkah Deployment:

1. **Persiapan Repository**:
   - Pastikan semua file berada di root repository GitHub Anda.
   - Struktur folder harus memiliki folder `backend/` dan `docs/`.

2. **Konfigurasi Railway**:
   - Hubungkan repository GitHub Anda ke Railway.
   - Railway akan secara otomatis mendeteksi `railway.json` atau `Procfile`.

3. **Environment Variables**:
   - Tambahkan `OPENAI_API_KEY` di bagian **Variables** di Railway untuk mengaktifkan fitur chatbot.
   - Jika menggunakan model lain, sesuaikan di `backend/chatbot.py`.

4. **Frontend Hosting**:
   - Folder `docs/` berisi file frontend. Anda bisa menggunakan Railway untuk melayani file statis ini atau menggunakan GitHub Pages.
   - Jika menggunakan Railway untuk keduanya, pastikan `app.py` melayani file statis dari folder `docs`.

5. **Aset Gambar**:
   - Masukkan gambar anime Anda ke dalam folder `docs/anime_assets/` dengan nama file berikut:
     - `standing.png` (Pose berdiri)
     - `sitting.png` (Pose duduk)
     - `buka_mulut.png` (Animasi mulut buka)
     - `tutup_mulut.png` (Animasi mulut tutup)
     - `blink.png` (Animasi mata berkedip)

## Fitur Baru:
- **Real-time Pose Detection**: Menggunakan MediaPipe untuk mendeteksi apakah Anda duduk atau berdiri.
- **Voice-to-Chat**: Bicara langsung, dan sistem akan mengirimkan teks ke chatbot.
- **Lip Sync**: Karakter anime akan membuka/tutup mulut saat membalas pesan Anda.
- **Overlay UI**: Chat muncul langsung di dalam area video.
