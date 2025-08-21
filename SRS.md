### **Software Requirements Specification (SRS): Aplikasi Catatan Keuangan Sederhana**


*   **Versi:** 1.0
*   **Tanggal:** 21 Agustus 2025
*   **Author:** Akhmad Khanif Zyen
*   **Status:** Disetujui

---

### **1. Pendahuluan**

**1.1. Tujuan**
Dokumen ini bertujuan untuk mendefinisikan secara rinci spesifikasi fungsional dan non-fungsional dari "Aplikasi Catatan Keuangan Sederhana". Dokumen ini akan menjadi acuan utama bagi tim pengembang dalam proses desain, implementasi, dan pengujian perangkat lunak.

**1.2. Ruang Lingkup Produk**
Perangkat lunak ini adalah aplikasi mobile mandiri (standalone) yang berfungsi untuk:
*   Mencatat transaksi pemasukan dan pengeluaran.
*   Mengelola kategori transaksi.
*   Menampilkan ringkasan dan laporan visual keuangan.
*   Menyediakan utilitas seperti pencarian, backup, dan restore data.

Aplikasi ini **tidak** mencakup fitur manajemen utang-piutang, budgeting, atau sinkronisasi data antar perangkat secara real-time.

**1.3. Definisi, Akronim, dan Singkatan**
*   **SRS:** Software Requirements Specification
*   **CRUD:** Create, Read, Update, Delete
*   **UI:** User Interface (Antarmuka Pengguna)
*   **FAB:** Floating Action Button
*   **API:** Application Programming Interface
*   **IAP:** In-App Purchase (Pembelian Dalam Aplikasi)

**1.4. Referensi**
*   Dokumen PRD: Aplikasi Catatan Keuangan Sederhana v1.0
*   Dokumen Desain Skema Database v1.0

### **2. Deskripsi Umum**

**2.1. Perspektif Produk**
Aplikasi ini merupakan produk mandiri yang berjalan di platform Android dan iOS. Aplikasi akan berinteraksi dengan API eksternal hanya untuk fungsi spesifik seperti Backup/Restore ke Google Drive dan Pembelian Dalam Aplikasi. Data inti pengguna disimpan secara lokal di perangkat.

**2.2. Fungsi Produk**
Fungsi utama perangkat lunak ini adalah:
*   **Fungsi Inti:** Manajemen Transaksi dan Kategori (CRUD).
*   **Fungsi Pelaporan:** Dashboard Ringkasan, Laporan Grafik.
*   **Fungsi Utilitas:** Pencarian Lanjutan, Pengaturan Aplikasi, Backup & Restore.
*   **Fungsi Monetisasi:** Tampilan Iklan dan IAP untuk menghapus iklan.

**2.3. Karakteristik Pengguna**
Pengguna adalah individu yang membutuhkan alat pencatatan keuangan yang sederhana dan cepat, memiliki kemampuan dasar dalam menggunakan smartphone, namun tidak harus memiliki pengetahuan mendalam tentang akuntansi atau keuangan.

**2.4. Batasan (Constraints)**
*   **C-1:** Aplikasi harus dibangun menggunakan Flutter.
*   **C-2:** State management harus menggunakan Riverpod dengan Riverpod Generator.
*   **C-3:** Navigasi harus dikelola oleh Go_Router.
*   **C-4:** Database lokal harus diimplementasikan menggunakan Drift.
*   **C-5:** Model data harus dibuat menggunakan Freezed.
*   **C-6:** Penanganan error dan data opsional harus memanfaatkan `fpdart`.
*   **C-7:** Aplikasi harus mendukung Android API level 21 (Lollipop) ke atas dan iOS 12 ke atas.

### **3. Persyaratan Spesifik**

#### **3.1. Persyaratan Fungsional**

**Modul 1: Manajemen Transaksi**
*   **REQ-FUNC-001:** Sistem harus menyediakan form untuk membuat transaksi baru dengan input: Tipe (Pemasukan/Pengeluaran), Tanggal, Kategori, Jumlah, dan Keterangan.
*   **REQ-FUNC-002:** Input Jumlah harus berupa numerik positif.
*   **REQ-FUNC-003:** Sistem harus menampilkan daftar semua transaksi di halaman utama, diurutkan berdasarkan tanggal terbaru.
*   **REQ-FUNC-004:** Transaksi Pemasukan dan Pengeluaran harus dapat dibedakan secara visual (misalnya, dengan warna).
*   **REQ-FUNC-005:** Pengguna harus dapat memilih transaksi yang ada untuk diubah (Update).
*   **REQ-FUNC-006:** Pengguna harus dapat menghapus transaksi yang ada setelah memberikan konfirmasi.

**Modul 2: Manajemen Kategori**
*   **REQ-FUNC-007:** Sistem harus menyediakan antarmuka untuk menambah kategori baru, dengan input: Nama dan Tipe (Pemasukan/Pengeluaran).
*   **REQ-FUNC-008:** Pengguna harus dapat mengubah nama kategori yang sudah ada.
*   **REQ-FUNC-009:** Pengguna harus dapat menghapus kategori.
*   **REQ-FUNC-010:** Sistem harus mencegah penghapusan kategori jika kategori tersebut masih digunakan oleh setidaknya satu transaksi.

**Modul 3: Dashboard & Ringkasan**
*   **REQ-FUNC-011:** Sistem harus menampilkan ringkasan total Pemasukan, Pengeluaran, dan Saldo (Pemasukan - Pengeluaran) di halaman utama.
*   **REQ-FUNC-012:** Pengguna harus dapat memfilter data ringkasan dan daftar transaksi berdasarkan periode: Harian, Mingguan, Bulanan, dan Tahunan.

**Modul 4: Laporan Grafik**
*   **REQ-FUNC-013:** Sistem harus dapat menampilkan laporan visual dalam bentuk grafik lingkaran (pie/donut chart) yang menunjukkan komposisi pengeluaran berdasarkan kategori.
*   **REQ-FUNC-014:** Pengguna harus dapat memfilter data grafik berdasarkan tipe (Pemasukan/Pengeluaran) dan periode waktu.

**Modul 5: Pencarian & Filter**
*   **REQ-FUNC-015:** Sistem harus menyediakan fungsionalitas pencarian transaksi berdasarkan teks pada kolom Keterangan.
*   **REQ-FUNC-016:** Pengguna harus dapat memfilter hasil pencarian berdasarkan Kategori dan rentang Jumlah (minimum dan maksimum).

**Modul 6: Backup & Restore**
*   **REQ-FUNC-017:** Sistem harus menyediakan fitur untuk membuat file backup dari database lokal dan menyimpannya di penyimpanan internal perangkat.
*   **REQ-FUNC-018:** Sistem harus menyediakan fitur untuk memulihkan data dari file backup yang ada di penyimpanan internal.
*   **REQ-FUNC-019:** Sistem harus dapat berintegrasi dengan Google Drive API untuk mencadangkan dan memulihkan file database.

**Modul 7: Pengaturan**
*   **REQ-FUNC-020:** Pengguna harus dapat mengganti tema warna aplikasi.
*   **REQ-FUNC-021:** Pengguna harus dapat memilih format mata uang.
*   **REQ-FUNC-022:** Pengguna harus dapat mengatur PIN untuk mengamankan akses ke aplikasi.
*   **REQ-FUNC-023:** Pengguna harus dapat mereset semua data aplikasi ke kondisi awal.

#### **3.2. Persyaratan Non-Fungsional**

*   **REQ-NONF-001 (Kinerja):**
    *   Waktu *cold start* aplikasi tidak lebih dari 3 detik.
    *   Waktu pemuatan data transaksi bulanan tidak lebih dari 500 milidetik pada perangkat kelas menengah.
    *   Animasi dan scrolling harus berjalan pada 60 FPS untuk menghindari *jank*.
*   **REQ-NONF-002 (Keandalan):**
    *   Aplikasi harus memiliki tingkat crash-free users di atas 99%.
    *   Proses backup dan restore harus transaksional untuk mencegah korupsi data.
*   **REQ-NONF-003 (Keamanan):**
    *   Data sensitif seperti PIN pengguna harus di-hash sebelum disimpan di database lokal.
    *   Akses ke file backup di Google Drive harus menggunakan otentikasi OAuth 2.0 yang aman.
*   **REQ-NONF-004 (Usability):**
    *   Antarmuka harus intuitif dan mengikuti panduan desain platform (Material Design untuk Android, Cupertino untuk iOS).
    *   Proses input transaksi baru harus dapat diselesaikan dalam minimal langkah.

#### **3.3. Persyaratan Antarmuka Eksternal**

*   **REQ-EXT-001 (Antarmuka Pengguna):**
    *   UI harus mengacu pada desain yang ditampilkan dalam screenshot referensi, dengan tata letak yang bersih dan navigasi yang jelas.
    *   Aplikasi harus responsif terhadap berbagai ukuran layar ponsel.
*   **REQ-EXT-002 (Antarmuka Perangkat Keras):**
    *   Aplikasi harus dapat mengakses sistem file perangkat untuk menyimpan dan membaca file backup lokal.
*   **REQ-EXT-003 (Antarmuka Perangkat Lunak):**
    *   **Google Drive API:** Digunakan untuk otentikasi, upload, dan download file database. Aplikasi harus meminta izin yang sesuai (`drive.appdata` atau `drive.file`).
    *   **Google Play Billing / StoreKit API:** Digunakan untuk mengelola produk IAP (Hapus Iklan, Donasi).
    *   **AdMob API:** Digunakan untuk menampilkan iklan banner.