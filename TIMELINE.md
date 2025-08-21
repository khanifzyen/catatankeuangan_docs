### **Timeline Pengembangan MVP: Aplikasi Catatan Keuangan Sederhana**

**Tujuan MVP:** Pengguna dapat mencatat transaksi pemasukan & pengeluaran, mengelola kategori, dan melihat ringkasan keuangan dasar (harian, mingguan, bulanan).

---

### **Sprint 1: Fondasi & Fungsionalitas Inti (Durasi: 2 Minggu)**

**Tujuan Sprint:** Membangun fondasi arsitektur, database, dan fungsionalitas CRUD (Create, Read, Update, Delete) untuk Kategori dan Transaksi. Di akhir sprint, aplikasi harus bisa mencatat dan menampilkan data, meskipun UI-nya masih dasar.

| Hari | Task ID | Tugas | Keterangan & Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Hari 1-2** | **S1-T01** | **Setup Proyek & Konfigurasi Awal** | Buat proyek Flutter baru, install semua dependensi (Riverpod, Drift, GoRouter, dll), setup linter, dan struktur folder sesuai SDD. | ☐ |
| | **S1-T02** | **Desain & Implementasi Database (Drift)** | Terjemahkan skema database (Tabel Transactions, Categories) ke dalam kode Drift. Buat file `app_database.dart`. | Tergantung S1-T01 | ☐ |
| | **S1-T03** | **Pembuatan Model Data (Freezed)** | Buat model `Transaction` dan `Category` menggunakan Freezed. | Tergantung S1-T02 | ☐ |
| **Hari 3-4** | **S1-T04** | **Implementasi Repository & DAO (Kategori)** | Buat DAO dan Repository (Interface & Implementasi) untuk CRUD Kategori. Integrasikan dengan Drift. | Tergantung S1-T02, S1-T03 | ☐ |
| | **S1-T05** | **UI: Halaman Manajemen Kategori** | Buat UI untuk menampilkan daftar kategori (dipisahkan tab Pemasukan/Pengeluaran), menambah, mengedit, dan menghapus kategori. | Tergantung S1-T04 | ☐ |
| | **S1-T06** | **State Management (Riverpod) untuk Kategori** | Buat `Provider` untuk menghubungkan UI Halaman Kategori dengan Repository Kategori. | Tergantung S1-T04, S1-T05 | ☐ |
| **Hari 5-7** | **S1-T07** | **Implementasi Repository & DAO (Transaksi)** | Buat DAO dan Repository untuk CRUD Transaksi. Termasuk fungsi untuk mengambil transaksi berdasarkan rentang tanggal (`watchTransactions`). | Tergantung S1-T02, S1-T03 | ☐ |
| | **S1-T08** | **UI: Halaman Tambah/Edit Transaksi** | Buat UI form untuk menambah dan mengedit transaksi. Input termasuk `DatePicker` untuk tanggal dan `Dropdown` untuk kategori. | Tergantung S1-T06, S1-T07 | ☐ |
| | **S1-T09** | **State Management (Riverpod) untuk Form Transaksi** | Buat `Provider` untuk mengelola state form dan logika penyimpanan transaksi. | Tergantung S1-T08 | ☐ |
| **Hari 8-9** | **S1-T10** | **UI: Halaman Utama (Dashboard - Daftar Transaksi)** | Buat UI dasar untuk menampilkan daftar transaksi yang diurutkan berdasarkan tanggal. Implementasikan item list untuk setiap transaksi. | Tergantung S1-T07 | ☐ |
| | **S1-T11** | **State Management (Riverpod) untuk Dashboard** | Buat `StreamProvider` yang "mendengarkan" perubahan data transaksi dari Repository dan secara otomatis memperbarui UI Dashboard. | Tergantung S1-T10 | ☐ |
| **Hari 10** | **S1-T12** | **Sprint Review, Testing & Refactoring** | Integrasi semua fitur, lakukan pengujian manual untuk alur utama, perbaiki bug minor, dan refactor kode jika diperlukan. | Semua task | ☐ |

---

### **Sprint 2: Penyempurnaan UI, Ringkasan, & Navigasi (Durasi: 2 Minggu)**

**Tujuan Sprint:** Menyempurnakan UI/UX, mengimplementasikan logika ringkasan (saldo), filter periode waktu, dan menyatukan semuanya dengan navigasi yang solid. Di akhir sprint, produk MVP siap untuk rilis internal atau beta.

| Hari | Task ID | Tugas | Keterangan & Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Hari 1-2** | **S2-T01** | **Implementasi Navigasi (GoRouter)** | Konfigurasikan semua rute (`/`, `/add-transaction`, `/categories`) dan implementasikan navigasi antar halaman. | Tergantung task UI dari Sprint 1 | ☐ |
| | **S2-T02** | **Logika Bisnis: Kalkulasi Ringkasan** | Buat `Provider` atau `UseCase` yang bergantung pada `transactionListProvider` untuk menghitung total Pemasukan, Pengeluaran, dan Saldo. | Tergantung S1-T11 | ☐ |
| | **S2-T03** | **UI: Komponen Ringkasan di Dashboard** | Buat widget untuk menampilkan kartu ringkasan (Pemasukan, Pengeluaran, Saldo) di bagian atas Halaman Utama. | Tergantung S2-T02 | ☐ |
| **Hari 3-5** | **S2-T04** | **Logika Bisnis: Filter Periode Waktu** | Implementasikan logika di `Provider` Dashboard untuk menerima parameter periode (Harian, Mingguan, Bulanan) dan memfilter data yang diambil dari Repository. | Tergantung S1-T11 | ☐ |
| | **S2-T05** | **UI: Komponen Filter di Dashboard** | Buat UI `TabBar` (Harian, Mingguan, Bulanan) di Halaman Utama. Hubungkan interaksi tab dengan `Provider` filter. | Tergambut S2-T04 | ☐ |
| | **S2-T06** | **UI: Pengelompokan Visual Transaksi** | Tambahkan header tanggal (`23 Mei 2024`, `22 Mei 2024`) di dalam daftar transaksi untuk visual grouping yang lebih baik. | Tergantung S1-T10 | ☐ |
| **Hari 6-7** | **S2-T07** | **Penyempurnaan UI/UX Global** | Terapkan tema warna, styling font, ikon, dan polesan visual lainnya di seluruh aplikasi agar terlihat konsisten dan profesional. | Semua task UI | ☐ |
| | **S2-T08** | **Penanganan Error di UI** | Implementasikan tampilan pesan error yang ramah pengguna (misalnya, `SnackBar`) saat operasi gagal (misalnya, gagal menyimpan transaksi). | Tergantung S1-T04, S1-T07 | ☐ |
| | **S2-T09** | **Penambahan Data Default (Seeding)** | Buat mekanisme untuk mengisi beberapa kategori default saat pengguna pertama kali membuka aplikasi. | Tergantung S1-T04 | ☐ |
| **Hari 8-9** | **S2-T10** | **Pengujian Fungsional End-to-End** | Lakukan pengujian menyeluruh untuk semua alur MVP: Buat Kategori -> Buat Transaksi -> Lihat di Dashboard -> Ganti Filter -> Edit Transaksi -> Hapus Transaksi. | Semua task | ☐ |
| | **S2-T11** | **Persiapan Build & Rilis** | Siapkan ikon aplikasi, splash screen, dan konfigurasikan file build (`build.gradle`, `Info.plist`) untuk rilis. | - | ☐ |
| **Hari 10** | **S2-T12** | **Sprint Review, Retrospective & Demo** | Lakukan demo fungsionalitas MVP yang sudah selesai. Kumpulkan feedback dan rencanakan langkah selanjutnya (Sprint 3 atau rilis). | Semua task | ☐ |

---

### **Catatan Tambahan:**

*   **Fleksibilitas:** Timeline ini adalah panduan. Beberapa tugas mungkin memakan waktu lebih cepat atau lebih lambat. Penting untuk melakukan *daily stand-up* untuk sinkronisasi progres.
*   **Testing:** Meskipun ada slot waktu khusus untuk testing, pengujian unit (unit testing) sebaiknya dilakukan secara paralel saat mengembangkan Repository dan Provider.
*   **Backlog:** Fitur-fitur lain dari PRD (Grafik, Pencarian, Backup, dll.) akan masuk ke dalam *product backlog* dan akan dijadwalkan untuk sprint-sprint berikutnya setelah MVP dirilis.