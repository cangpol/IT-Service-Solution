# Panduan Setup Database MySQL / MariaDB pada Synology NAS via phpMyAdmin

Panduan ini ditujukan untuk tim IT & BTIK **Universitas Pignatelli Triputra (UPITRA)** untuk meng-hosting basis data sistem IT Helpdesk pada unit **Synology NAS**.

---

## 1. Prasyarat pada Synology NAS (DSM)

Pastikan paket berikut telah terinstal dan aktif melalui **Package Center** di Synology DSM:
1. **MariaDB 10** (atau MariaDB 5 / MySQL Server)
2. **phpMyAdmin**

> **Penting**: Catat port MariaDB Anda di DSM (Port default MariaDB 10 di Synology biasanya **3307** atau **3306**). Pastikan opsi *"Enable TCP/IP connection"* dicentang pada pengaturan MariaDB di Synology DSM.

---

## 2. Langkah Impor Skrip `database.sql` via phpMyAdmin

1. **Buka antarmuka phpMyAdmin**:
   - Akses via browser: `http://[IP_SYNOLOGY_NAS]/phpMyAdmin`
   - Masuk dengan username: `root` (atau akun admin database Anda) beserta password yang telah ditentukan saat instalasi MariaDB di Synology.
2. **Impor Basis Data**:
   - Pada menu bar atas phpMyAdmin, klik tab **Import** (Impor).
   - Pada bagian **File to import**, klik **Choose File** (Pilih Berkas) dan arahkan ke file:
     ```
     database.sql
     ```
     *(Berkas ini berada di folder utama proyek `IT Service Solution`)*.
   - Biarkan opsi Character set: **utf-8** dan Format: **SQL**.
   - Gulir ke bawah dan klik tombol **Go** (Kirim).
3. **Verifikasi**:
   - Setelah proses selesai (biasanya 2-5 detik), basis data baru bernama **`upitra_helpdesk`** akan muncul di panel sebelah kiri.
   - Di dalamnya terdapat 8 tabel yang siap pakai:
     - `categories` (Kategori layanan IT UPITRA)
     - `feedback` (Survei kepuasan CSAT)
     - `knowledge_articles` (Pusat bantuan & solusi mandiri)
     - `service_status` (Status operasional server kampus)
     - `tickets` (Daftar tiket keluhan & insiden)
     - `ticket_messages` (Percakapan pelapor & teknisi)
     - `ticket_timeline` (Audit trail progres tiket)
     - `users` (Data sivitas akademika)

---

## 3. Menghubungkan Aplikasi Next.js ke Database Synology NAS

1. Buat file `.env` di folder proyek Next.js (salin dari `.env.example`).
2. Masukkan format URL koneksi database:
   ```env
   # Contoh jika port MariaDB di Synology adalah 3306:
   DATABASE_URL="mysql://root:PasswordAnda@192.168.1.100:3306/upitra_helpdesk"

   # Atau jika menggunakan MariaDB 10 dengan port 3307:
   DATABASE_URL="mysql://root:PasswordAnda@192.168.1.100:3307/upitra_helpdesk"
   ```
   *Gantilah `192.168.1.100` dengan alamat IP lokal Synology NAS Anda di jaringan kampus UPITRA.*

3. **Sinkronisasi Prisma ORM**:
   Jalankan perintah berikut di terminal:
   ```bash
   npx prisma generate
   ```

---

## 4. Tips Keamanan & Pengaturan Akses Jaringan (Firewall Synology)
- Jika aplikasi Next.js dijalankan di server terpisah dari Synology, pastikan port MariaDB (3306/3307) diizinkan di **Control Panel > Security > Firewall** pada Synology DSM untuk subnet jaringan lokal kampus.
- Disarankan membuat user khusus (bukan `root`) di phpMyAdmin dengan hak akses penuh hanya pada database `upitra_helpdesk`:
  ```sql
  CREATE USER 'upitra_app'@'%' IDENTIFIED BY 'PasswordKuat123!';
  GRANT ALL PRIVILEGES ON upitra_helpdesk.* TO 'upitra_app'@'%';
  FLUSH PRIVILEGES;
  ```

