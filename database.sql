-- ====================================================================
-- DATABASE SCHEMA & SEED DATA: IT HELPDESK & TICKETING SYSTEM
-- UNIVERSITAS PIGNATELLI TRIPUTRA (UPITRA)
-- Target Server: MySQL 5.7+ / 8.0+ / MariaDB 10+ (phpMyAdmin Synology NAS)
-- Encoding: UTF-8 Unicode (utf8mb4)
-- Features: User Authentication, Anti-Spam Security, SLA Analytics
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `upitra_helpdesk` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `upitra_helpdesk`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `security_logs`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `ticket_timeline`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `knowledge_articles`;
DROP TABLE IF EXISTS `service_status`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. TABEL PENGGUNA & AUTENTIKASI SIVITAS AKADEMIKA (users)
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '$2a$12$upitra123defaultpasswordhash' COMMENT 'Kredensial kata sandi pengguna',
  `role` ENUM('STUDENT', 'LECTURER', 'STAFF', 'TECHNICIAN', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `identifier` VARCHAR(50) DEFAULT NULL COMMENT 'NIM untuk Mahasiswa, NIP/NIDN untuk Dosen & Staf',
  `department` VARCHAR(100) DEFAULT NULL COMMENT 'Program Studi atau Unit Kerja di UPITRA',
  `phone` VARCHAR(30) DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Aktif, 0: Dinonaktifkan / Diblokir karena usil',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. TABEL KATEGORI LAYANAN IT (categories)
-- --------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'HelpCircle',
  `sla_hours` INT NOT NULL DEFAULT 24 COMMENT 'Target waktu penyelesaian dalam jam',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. TABEL TIKET LAYANAN (tickets) - Mendukung Status REJECTED_SPAM
-- --------------------------------------------------------------------
CREATE TABLE `tickets` (
  `id` VARCHAR(36) NOT NULL,
  `ticket_number` VARCHAR(30) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` INT NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'PENDING_VENDOR', 'RESOLVED', 'CLOSED', 'REJECTED_SPAM') NOT NULL DEFAULT 'OPEN',
  `requester_name` VARCHAR(150) NOT NULL,
  `requester_email` VARCHAR(150) NOT NULL,
  `requester_role` VARCHAR(50) NOT NULL DEFAULT 'Mahasiswa',
  `requester_id` VARCHAR(50) DEFAULT NULL COMMENT 'NIM atau NIP pelapor',
  `requester_phone` VARCHAR(30) DEFAULT NULL,
  `location_building` VARCHAR(100) NOT NULL COMMENT 'Gedung A, Gedung B, Gedung Rektorat, dll',
  `location_room` VARCHAR(100) NOT NULL COMMENT 'Ruang Kelas, Nomor Lab, dsb',
  `assigned_to` VARCHAR(36) DEFAULT NULL COMMENT 'ID Teknisi BTIK yang ditugaskan',
  `sla_due_at` DATETIME DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `is_spam_flagged` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Tiket terindikasi palsu/usil, dikeluarkan dari SLA',
  `spam_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_number` (`ticket_number`),
  KEY `idx_tickets_status` (`status`),
  KEY `idx_tickets_priority` (`priority`),
  KEY `idx_tickets_category` (`category_id`),
  KEY `idx_tickets_assigned` (`assigned_to`),
  CONSTRAINT `fk_tickets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_technician` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. TABEL PERCAKAPAN & CATATAN TIKET (ticket_messages)
-- --------------------------------------------------------------------
CREATE TABLE `ticket_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` VARCHAR(36) NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `sender_role` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `is_internal` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Catatan internal teknisi, 0: Pesan publik',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_ticket` (`ticket_id`),
  CONSTRAINT `fk_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. TABEL AUDIT TIMELINE TIKET (ticket_timeline)
-- --------------------------------------------------------------------
CREATE TABLE `ticket_timeline` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status_code` VARCHAR(50) NOT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_timeline_ticket` (`ticket_id`),
  CONSTRAINT `fk_timeline_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. TABEL SURVEI KEPUASAN LAYANAN CSAT (feedback)
-- --------------------------------------------------------------------
CREATE TABLE `feedback` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` VARCHAR(36) NOT NULL,
  `rating` TINYINT NOT NULL COMMENT 'Skor 1 sampai 5',
  `comment` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feedback_ticket` (`ticket_id`),
  CONSTRAINT `fk_feedback_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. TABEL LOG KEAMANAN & FRAUD AUDIT (security_logs)
-- --------------------------------------------------------------------
CREATE TABLE `security_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(30) DEFAULT NULL,
  `reporter_email` VARCHAR(150) NOT NULL,
  `incident_type` VARCHAR(50) NOT NULL COMMENT 'SPAM_TICKET, BOT_ATTEMPT, BRUTE_FORCE, USER_BLOCKED',
  `reason` TEXT NOT NULL,
  `action_taken` VARCHAR(100) NOT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_security_email` (`reporter_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. TABEL PUSAT BANTUAN MANDIRI (knowledge_articles)
-- --------------------------------------------------------------------
CREATE TABLE `knowledge_articles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `excerpt` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `tags` VARCHAR(255) DEFAULT NULL,
  `views` INT NOT NULL DEFAULT 0,
  `helpful_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kb_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. TABEL STATUS OPERASIONAL SERVER KAMPUS (service_status)
-- --------------------------------------------------------------------
CREATE TABLE `service_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('OPERATIONAL', 'DEGRADED', 'MAINTENANCE') NOT NULL DEFAULT 'OPERATIONAL',
  `uptime_percent` DECIMAL(5,2) NOT NULL DEFAULT 99.90,
  `last_checked` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- SEED DATA AWAL: UNIVERSITAS PIGNATELLI TRIPUTRA (UPITRA)
-- ====================================================================

-- 1. USERS & KREDENSIAL DEFAULT (Password: upitra123)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `identifier`, `department`, `phone`, `is_active`, `last_login_at`) VALUES
('usr-btik-001', 'Ir. Haryanto, M.T.', 'haryanto@upitra.ac.id', 'upitra123', 'ADMIN', 'BTIK-001', 'Kepala Biro TIK', '081234567890', 1, NOW()),
('usr-btik-002', 'Robertus Wijaya, S.Kom.', 'robertus.w@upitra.ac.id', 'upitra123', 'TECHNICIAN', 'BTIK-004', 'Infrastruktur & Jaringan', '081234567891', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('usr-btik-003', 'Kevin Triputra, S.Inf.', 'kevin.t@upitra.ac.id', 'upitra123', 'TECHNICIAN', 'BTIK-007', 'Sistem Informasi & Aplikasi', '081234567892', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('usr-dsn-001', 'Dr. Maria Yosephine, M.Kom.', 'maria.yosephine@upitra.ac.id', 'upitra123', 'LECTURER', '0612088501', 'S1 Sistem Informasi', '081398765432', 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('usr-mhs-001', 'Budi Santoso', 'budi.santoso@student.upitra.ac.id', 'upitra123', 'STUDENT', '2023010045', 'S1 Informatika', '081512345678', 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('usr-mhs-002', 'Anastasia Putri', 'anastasia.p@student.upitra.ac.id', 'upitra123', 'STUDENT', '2024010112', 'S1 Manajemen Bisnis', '08177889900', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('usr-spm-001', 'Akun Usil Terblokir', 'iseng@student.upitra.ac.id', 'upitra123', 'STUDENT', '2023019999', 'S1 Informatika', '08999999999', 0, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 2. CATEGORIES
INSERT INTO `categories` (`id`, `name`, `description`, `icon`, `sla_hours`, `is_active`) VALUES
(1, 'Jaringan & WiFi Kampus', 'Kendala koneksi internet, WiFi UPITRA-Hotspot, port LAN, dan akses eduroam', 'Wifi', 4, 1),
(2, 'SIAKAD & Sistem Akademik', 'Masalah login, KRS error, sync nilai, dan data kemahasiswaan', 'GraduationCap', 6, 1),
(3, 'LMS & Kuliah Online', 'Akses e-learning Moodle, sinkronisasi mata kuliah, dan submission tugas', 'BookOpen', 6, 1),
(4, 'Akun & Email Institusi', 'Aktivasi @student.upitra.ac.id, lisensi Microsoft 365, reset password', 'Mail', 8, 1),
(5, 'Hardware & Fasilitas Lab', 'Kerusakan PC Lab, instalasi software praktikum (SPSS, MATLAB), printer', 'Monitor', 12, 1),
(6, 'Multimedia Ruang Kuliah', 'Proyektor kelas, sound system auditorium, perlengkapan kuliah hybrid', 'Tv', 2, 1);

-- 3. TICKETS (Mencakup Tiket Normal & Contoh Tiket Usil/Spam REJECTED_SPAM)
INSERT INTO `tickets` (`id`, `ticket_number`, `title`, `description`, `category_id`, `priority`, `status`, `requester_name`, `requester_email`, `requester_role`, `requester_id`, `requester_phone`, `location_building`, `location_room`, `assigned_to`, `sla_due_at`, `resolved_at`, `is_spam_flagged`, `spam_reason`, `created_at`) VALUES
('tkt-001', 'UPITRA-2026-0891', 'Gagal Login SIAKAD untuk Pengisian KRS Semester Ganjil', 'Muncul notifikasi "Invalid Credential" padahal password sudah sesuai dengan email kampus. Mohon dibantu reset akses.', 2, 'HIGH', 'IN_PROGRESS', 'Budi Santoso', 'budi.santoso@student.upitra.ac.id', 'Mahasiswa', '2023010045', '081512345678', 'Gedung A', 'Ruang BEM Lantai 2', 'usr-btik-003', DATE_ADD(NOW(), INTERVAL 4 HOUR), NULL, 0, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

('tkt-002', 'UPITRA-2026-0892', 'Proyektor Ruang B.302 Berkedip dan Tidak Muncul Sinyal HDMI', 'Saat kuliah Perancangan Basis Data, proyektor mati setiap 5 menit dan port HDMI di meja dosen longgar.', 6, 'CRITICAL', 'RESOLVED', 'Dr. Maria Yosephine, M.Kom.', 'maria.yosephine@upitra.ac.id', 'Dosen', '0612088501', '081398765432', 'Gedung B', 'Ruang Kelas B.302', 'usr-btik-002', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0, NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

('tkt-003', 'UPITRA-2026-0893', 'Permohonan Aktivasi Lisensi Microsoft 365 Mahasiswa Baru', 'Membutuhkan akses Microsoft Word dan Excel untuk pengerjaan tugas proyek akhir. Email kampus sudah aktif.', 4, 'LOW', 'OPEN', 'Anastasia Putri', 'anastasia.p@student.upitra.ac.id', 'Mahasiswa', '2024010112', '08177889900', 'Gedung Perpustakaan', 'Lantai 1 - Area Baca', NULL, DATE_ADD(NOW(), INTERVAL 8 HOUR), NULL, 0, NULL, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

('tkt-004', 'UPITRA-2026-0894', 'Koneksi WiFi UPITRA-Hotspot di Lab Komputer 2 Sangat Lambat', 'Kecepatan unduh hanya 0.5 Mbps saat seluruh mahasiswa praktikum mengakses internet. Sering disconnect.', 1, 'MEDIUM', 'IN_PROGRESS', 'Stefanus Kevin', 'kevin.s@student.upitra.ac.id', 'Mahasiswa', '2022010018', '08192837465', 'Gedung A', 'Lab Komputer 2 (Lt 3)', 'usr-btik-002', DATE_ADD(NOW(), INTERVAL 3 HOUR), NULL, 0, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

('tkt-005', 'UPITRA-2026-0895', 'Instalasi Software SPSS 29 untuk 30 Komputer Lab A', 'Dibutuhkan instalasi software analisis data SPSS versi terbaru untuk mata kuliah Statistika Bisnis.', 5, 'MEDIUM', 'CLOSED', 'Ignatius Danu, S.E., M.M.', 'danu@upitra.ac.id', 'Dosen', '0619047702', '08182233445', 'Gedung B', 'Lab Komputer 1', 'usr-btik-003', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), 0, NULL, DATE_SUB(NOW(), INTERVAL 30 HOUR)),

('tkt-099', 'UPITRA-2026-0099', 'Coba tes iseng doang wkwkwk tolong antar es kopi', 'Mau coba sistem helpdesk aja apakah adminnya galak atau fast respon wkwk', 1, 'CRITICAL', 'REJECTED_SPAM', 'Akun Usil Terblokir', 'iseng@student.upitra.ac.id', 'Mahasiswa', '2023019999', '08999999999', 'Gedung A', 'Kantin Bawah', 'usr-btik-001', NULL, NULL, 1, 'Laporan palsu / prank yang menyalahgunakan prioritas darurat', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 4. SECURITY AUDIT LOGS
INSERT INTO `security_logs` (`ticket_number`, `reporter_email`, `incident_type`, `reason`, `action_taken`, `actor_name`, `ip_address`) VALUES
('UPITRA-2026-0099', 'iseng@student.upitra.ac.id', 'SPAM_TICKET', 'Pengajuan tiket iseng/prank pesan kopi dengan prioritas darurat', 'Tiket ditolak (REJECTED_SPAM) & akun mahasiswa disuspend 7 hari', 'Ir. Haryanto, M.T. (Admin BTIK)', '192.168.10.45');

-- 5. TICKET MESSAGES
INSERT INTO `ticket_messages` (`ticket_id`, `sender_name`, `sender_role`, `message`, `is_internal`, `created_at`) VALUES
('tkt-001', 'Budi Santoso', 'Mahasiswa', 'Selamat pagi tim BTIK, mohon bantuannya karena batas pengisian KRS berakhir besok sore.', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('tkt-001', 'Kevin Triputra, S.Inf.', 'Teknisi BTIK', 'Halo Budi, tiket Anda sedang kami periksa pada basis data akun SSO. Mohon pastikan kembali username menggunakan NIM tanpa spasi.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('tkt-001', 'Kevin Triputra, S.Inf.', 'Teknisi BTIK', 'Catatan internal: Sinkronisasi LDAP SIAKAD sempat delay pasca maintenance jam 02:00 pagi. Sedang re-sync.', 1, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('tkt-099', 'Ir. Haryanto, M.T.', 'Admin BTIK', 'Tiket ini teridentifikasi sebagai laporan palsu/usil. Tiket ditolak dan akun pelapor dinonaktifkan sementara sesuai SOP BTIK UPITRA.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 6. TICKET TIMELINE
INSERT INTO `ticket_timeline` (`ticket_id`, `title`, `description`, `status_code`, `actor_name`, `created_at`) VALUES
('tkt-001', 'Tiket Dibuat', 'Pelapor mengajukan tiket keluhan SIAKAD', 'OPEN', 'Budi Santoso', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('tkt-001', 'Ditugaskan ke Teknisi', 'Tiket didelegasikan kepada Kevin Triputra', 'IN_PROGRESS', 'Sistem Helpdesk BTIK', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('tkt-002', 'Tiket Dibuat', 'Pelapor melaporkan proyektor ruang kuliah bermasalah', 'OPEN', 'Dr. Maria Yosephine, M.Kom.', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('tkt-002', 'Sedang Ditangani di Lokasi', 'Teknisi menuju ke Ruang B.302', 'IN_PROGRESS', 'Robertus Wijaya, S.Kom.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('tkt-002', 'Masalah Teratasi', 'Penggantian kabel selesai dan display normal', 'RESOLVED', 'Robertus Wijaya, S.Kom.', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('tkt-099', 'Tiket Ditolak (Spam)', 'Laporan palsu/usil terdeteksi oleh sistem BTIK', 'REJECTED_SPAM', 'Ir. Haryanto, M.T.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7. FEEDBACK
INSERT INTO `feedback` (`ticket_id`, `rating`, `comment`, `created_at`) VALUES
('tkt-002', 5, 'Respon teknisi sangat cepat, hanya 10 menit langsung hadir ke kelas sehingga kuliah dapat dilanjutkan. Terima kasih BTIK UPITRA!', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('tkt-005', 5, 'Instalasi SPSS di semua 30 unit PC Lab selesai tepat waktu sebelum praktikum mahasiswa dimulai. Sangat memuaskan.', DATE_SUB(NOW(), INTERVAL 15 HOUR));

-- 8. KNOWLEDGE ARTICLES
INSERT INTO `knowledge_articles` (`title`, `category`, `excerpt`, `content`, `tags`, `views`, `helpful_count`) VALUES
('Cara Menghubungkan Laptop & HP ke WiFi UPITRA-Hotspot', 'Jaringan & WiFi', 'Panduan login WiFi kampus dengan akun SSO sivitas akademika Universitas Pignatelli Triputra.', 
'### Langkah Koneksi ke WiFi UPITRA-Hotspot:\n1. Buka pengaturan WiFi pada perangkat laptop atau ponsel Anda.\n2. Pilih SSID: **UPITRA-Hotspot** atau **eduroam** jika memiliki akun roaming antar universitas.\n3. Masukkan identitas akun SSO Anda:\n   - **Mahasiswa**: Username menggunakan NIM (contoh: 2023010045) dan kata sandi email institusi.\n   - **Dosen & Tendik**: Username menggunakan NIP/NIDN.\n4. Apabila halaman captive portal tidak muncul otomatis, buka peramban dan kunjungi: `http://wifi.upitra.ac.id`.\n5. Klik **Masuk** dan nikmati akses internet kampus dengan kuota tak terbatas.',
'wifi, internet, eduroam, login', 342, 89),

('Panduan Reset Mandiri Password SIAKAD 2.0', 'Sistem Akademik', 'Langkah pemulihan kata sandi portal akademik tanpa harus datang langsung ke kantor BTIK.', 
'### Cara Reset Password SIAKAD:\n1. Akses halaman resmi SIAKAD di `https://siakad.upitra.ac.id`.\n2. Klik tautan **Lupa Password?** di bawah tombol login.\n3. Masukkan alamat email institusi Anda (`@student.upitra.ac.id` atau `@upitra.ac.id`).\n4. Buka inbox email Anda dan temukan surat konfirmasi dari **Biro TIK UPITRA**.\n5. Klik tombol verifikasi dan buat kata sandi baru minimal 8 karakter.\n6. Coba login kembali ke SIAKAD.',
'siakad, password, reset, login', 520, 142),

('Aktivasi Lisensi Microsoft 365 Edukasi Gratis', 'Akun & Software', 'Petunjuk download dan aktivasi lisensi Office 365 resmi untuk mahasiswa dan dosen UPITRA.', 
'### Hak Akses Microsoft 365 UPITRA:\nSeluruh sivitas akademika berhak mendapatkan lisensi resmi Office 365 (Word, Excel, PowerPoint, Teams, OneDrive 1TB).\n\n1. Kunjungi portal resmi: `https://portal.office.com`.\n2. Masuk menggunakan email institusi UPITRA Anda.\n3. Setelah berhasil masuk ke dashboard, klik tombol **Install Office** di pojok kanan atas.\n4. Unduh installer dan jalankan hingga selesai.',
'office, word, excel, microsoft365, lisensi', 415, 110),

('Prosedur Peminjaman Alat Multimedia & Zoom Webinar', 'Multimedia', 'SOP peminjaman proyektor portabel, mic wireless, dan akun Zoom Room BTIK untuk kegiatan kampus.', 
'### Ketentuan Peminjaman Fasilitas Multimedia:\n1. Pengajuan wajib dilakukan minimal **H-2 kegiatan** melalui form IT Helpdesk atau surat pengantar BEM/HIMA.\n2. Unit multimedia mencakup proyektor, mic wireless, sound portable, dan akun Zoom 500 peserta.\n3. Pengambilan dan pengembalian bertempat di Ruang BTIK Lantai 2 Gedung Rektorat.',
'multimedia, proyektor, zoom, webinar, ormawa', 188, 45);

-- 9. SERVICE STATUS
INSERT INTO `service_status` (`service_name`, `description`, `status`, `uptime_percent`, `last_checked`) VALUES
('SIAKAD 2.0 UPITRA', 'Sistem Informasi Akademik Mahasiswa & Dosen', 'OPERATIONAL', 99.95, NOW()),
('LMS E-Learning Kampus', 'Platform Moodle Pembelajaran Online', 'OPERATIONAL', 99.80, NOW()),
('Koneksi Internet & WiFi Kampus', 'Hotspot Gedung A, Gedung B, dan Perpustakaan', 'OPERATIONAL', 99.70, NOW()),
('Email Institusi Google Workspace', 'Layanan email @student.upitra.ac.id dan @upitra.ac.id', 'OPERATIONAL', 100.00, NOW()),
('Laboratorium Komputer Terpadu', 'Jaringan LAN dan PC Praktikum Lab 1-3', 'OPERATIONAL', 99.85, NOW()),
('Portal Pembayaran & Keuangan Mahasiswa', 'Sistem Tagihan Kuliah Terintegrasi Bank', 'OPERATIONAL', 99.90, NOW());
