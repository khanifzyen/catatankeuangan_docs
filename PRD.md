### **Product Requirements Document (PRD): Aplikasi Catatan Keuangan Sederhana**

*   **Versi:** 1.0
*   **Tanggal:** 21 Agustus 2025
*   **Author:** Akhmad Khanif Zyen
*   **Status:** Disetujui

---

### **1. Latar Belakang & Visi Produk**

**1.1. Masalah yang Diselesaikan**
Banyak aplikasi pencatatan keuangan yang ada saat ini terlalu kompleks, dipenuhi fitur yang tidak dibutuhkan oleh pengguna biasa seperti budgeting, investasi, atau sinkronisasi multi-rekening. Hal ini membuat pengguna merasa kewalahan dan akhirnya berhenti mencatat keuangan mereka. Pengguna membutuhkan alat yang **sangat cepat, sederhana, dan fokus** pada fungsi inti: mencatat pemasukan dan pengeluaran.

**1.2. Visi Produk**
Menjadi aplikasi pencatatan keuangan pribadi yang paling **mudah dan cepat digunakan** di platform mobile, memungkinkan siapa saja untuk membangun kebiasaan mencatat keuangan tanpa merasa terbebani oleh kompleksitas.

**1.3. Proposisi Nilai Utama (Unique Value Proposition)**
"Catat keuanganmu dalam hitungan detik. Simpel, ringan, dan fokus pada yang terpenting."

### **2. Target Pengguna**

Aplikasi ini ditujukan untuk individu yang memprioritaskan kesederhanaan dan kecepatan.

*   **Persona 1: Andi, Mahasiswa**
    *   **Kebutuhan:** Melacak uang saku, pendapatan dari kerja paruh waktu, dan pengeluaran harian (makan, transportasi, tugas kuliah).
    *   **Frustrasi:** Aplikasi lain terlalu rumit, butuh banyak setup. Ia hanya ingin tahu sisa uangnya bulan ini.
    *   **Tujuan:** Dengan cepat mencatat setiap pengeluaran agar tidak "boros" tanpa sadar.

*   **Persona 2: Rina, Freelancer Pemula**
    *   **Kebutuhan:** Memisahkan catatan pemasukan dari proyek dan pengeluaran untuk kebutuhan kerja (internet, software).
    *   **Frustrasi:** Spreadsheet terasa merepotkan di ponsel. Aplikasi akuntansi terlalu mahal dan berlebihan.
    *   **Tujuan:** Melihat ringkasan pemasukan dan pengeluaran bulanan dengan mudah untuk merencanakan keuangan.

### **3. Tujuan & Metrik Kesuksesan**

**3.1. Tujuan Produk**
*   **Bagi Pengguna:** Memberikan pengalaman mencatat transaksi yang secepat dan semudah mungkin.
*   **Bagi Developer:** Membangun aplikasi yang solid, mudah dipelihara, dan memiliki potensi untuk dimonetisasi secara etis (tidak mengganggu).

**3.2. Metrik Kesuksesan**
*   **Engagement:**
    *   Jumlah transaksi yang dicatat per pengguna aktif per minggu > 5.
    *   Tingkat adopsi fitur grafik dan pencarian > 30% dari pengguna aktif bulanan.
*   **Retensi:**
    *   Retensi Hari ke-7 (Day 7 Retention) > 20%.
    *   Retensi Hari ke-30 (Day 30 Retention) > 10%.
*   **Kepuasan:**
    *   Rating rata-rata di App Store / Play Store ≥ 4.5 bintang.
*   **Monetisasi (Setelah implementasi):**
    *   Conversion rate untuk pembelian "Hapus Iklan" > 1%.

### **4. Fitur & Ruang Lingkup (Scope)**

Fitur akan dibagi menjadi beberapa fase rilis untuk memastikan pengembangan yang terfokus.

#### **4.1. Rilis MVP (Minimum Viable Product)**
Fokus pada fungsionalitas inti agar aplikasi dapat digunakan dan memberikan nilai sejak awal.

| ID | Fitur | Deskripsi | Prioritas |
| :--- | :--- | :--- | :--- |
| **F1.1** | **Manajemen Transaksi** | Pengguna dapat membuat, melihat, mengedit, dan menghapus transaksi pemasukan & pengeluaran. Form input terdiri dari tanggal, kategori, jumlah, dan keterangan. | **Wajib** |
| **F2.1** | **Dashboard & Ringkasan** | Halaman utama menampilkan ringkasan total Pemasukan, Pengeluaran, dan Saldo untuk periode yang dipilih (default: Bulan Ini). | **Wajib** |
| **F2.2** | **Filter Periode Dasar** | Terdapat filter berbasis Tab untuk melihat data **Harian, Mingguan, dan Bulanan**. | **Wajib** |
| **F3.1** | **Manajemen Kategori** | Pengguna dapat membuat, mengedit, dan menghapus kategori sendiri, terpisah untuk Pemasukan dan Pengeluaran. | **Wajib** |

#### **4.2. Rilis Selanjutnya (Post-MVP)**
Fitur-fitur ini akan dikembangkan setelah MVP berhasil diluncurkan dan divalidasi.

| ID | Fitur | Deskripsi | Prioritas |
| :--- | :--- | :--- | :--- |
| **F4.1** | **Grafik & Laporan Visual** | Halaman grafik lingkaran (pie chart) untuk visualisasi persentase pengeluaran/pemasukan per kategori. | **Tinggi** |
| **F5.1** | **Pencarian & Filter Lanjutan** | Halaman pencarian khusus dengan filter berdasarkan kata kunci, kategori, dan rentang jumlah. | **Tinggi** |
| **F7.1** | **Backup & Restore Lokal** | Fungsi untuk mencadangkan database ke file di penyimpanan perangkat dan memulihkannya. | **Tinggi** |
| **F6.1** | **Pengaturan Dasar** | Opsi untuk mengubah format mata uang dan mengatur hari pertama dalam seminggu. | **Medium** |
| **F7.2** | **Backup & Restore Google Drive** | Integrasi dengan Google Drive untuk backup dan restore data secara cloud. | **Medium** |
| **F9.1** | **Monetisasi** | Implementasi iklan banner dan opsi pembelian dalam aplikasi (IAP) untuk menghapus iklan dan donasi. | **Medium** |
| **F6.2** | **Keamanan (PIN)** | Fitur untuk mengunci aplikasi menggunakan PIN. | **Rendah** |

#### **4.3. Tidak Termasuk dalam Ruang Lingkup (Out of Scope)**
Fitur-fitur berikut secara eksplisit **TIDAK** akan dibuat dalam waktu dekat untuk menjaga kesederhanaan aplikasi:
*   Manajemen Hutang & Piutang.
*   Fitur Budgeting (Anggaran).
*   Sinkronisasi otomatis antar perangkat.
*   Koneksi langsung ke rekening bank.
*   Multi-dompet/akun.

### **5. Alur Pengguna (User Flow)**

**5.1. Alur Utama: Mencatat Transaksi Baru**
1.  Pengguna membuka aplikasi dan mendarat di **Halaman Utama (Dashboard)**.
2.  Pengguna menekan **Floating Action Button (FAB) `+`**.
3.  Aplikasi menampilkan **Halaman Buat Transaksi**.
4.  Pengguna memilih tipe (Pengeluaran/Pemasukan), mengisi tanggal, kategori, jumlah, dan keterangan.
5.  Pengguna menekan tombol **"Simpan"**.
6.  Aplikasi kembali ke **Halaman Utama**, dan daftar transaksi serta ringkasan saldo otomatis diperbarui.

**5.2. Alur Sekunder: Melihat Laporan Grafik Pengeluaran Bulanan**
1.  Dari **Halaman Utama**, pengguna membuka menu navigasi.
2.  Pengguna memilih menu **"Grafik"**.
3.  Aplikasi menampilkan **Halaman Grafik** dengan data pengeluaran bulan ini secara default.
4.  Pengguna dapat menggunakan navigasi `< Bulan >` untuk melihat data bulan-bulan sebelumnya.

### **6. Persyaratan Non-Fungsional**

*   **Kinerja:**
    *   Waktu buka aplikasi (cold start) harus di bawah 3 detik.
    *   Navigasi antar halaman terasa instan (< 300ms).
    *   Animasi dan scrolling harus berjalan mulus pada 60 FPS.
*   **Keamanan:**
    *   Data disimpan secara lokal di dalam *sandboxed storage* aplikasi.
    *   Jika fitur PIN diaktifkan, proses verifikasi harus aman.
*   **Usability:**
    *   UI harus bersih, intuitif, dan konsisten.
    *   Proses pencatatan transaksi harus dapat diselesaikan dalam kurang dari 4 kali tap/klik.
*   **Teknologi:**
    *   Aplikasi dibangun menggunakan Flutter dengan *tech stack* yang telah ditentukan (Riverpod, GoRouter, Drift, Freezed, fpdart).
    *   Arsitektur mengikuti prinsip Clean Architecture untuk skalabilitas dan kemudahan pemeliharaan.