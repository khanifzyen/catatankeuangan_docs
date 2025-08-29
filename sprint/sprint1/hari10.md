### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 1 (Hari 10)**

**Tujuan Utama:** Memastikan semua fitur yang dikembangkan dalam Sprint 1 (Manajemen Kategori dan Transaksi) terintegrasi dengan baik, berfungsi sesuai harapan, dan memiliki kualitas kode yang baik. Ini adalah fase *quality assurance* internal sebelum melanjutkan ke Sprint 2.

---

### **Task S1-T12: Sprint Review, Testing & Refactoring**

**Tujuan:** Mengintegrasikan semua komponen, melakukan pengujian manual pada alur pengguna utama, mengidentifikasi dan memperbaiki bug, serta melakukan refactoring untuk meningkatkan kualitas kode.

**Referensi Dokumen:**
*   **SRS.md:** Untuk memastikan semua persyaratan fungsional (REQ-FUNC) terkait kategori dan transaksi terpenuhi.
*   **PRD.md (Bagian 5.1 - Alur Utama):** Sebagai panduan untuk skenario pengujian utama.
*   **Semua kode yang telah ditulis di Sprint 1.**

#### **Langkah 1: Integrasi Awal & Navigasi Sederhana**

Sebelum pengujian, pastikan semua halaman dapat diakses. Karena GoRouter baru akan diimplementasikan di Sprint 2, kita akan menggunakan navigasi sementara.

1.  **Hubungkan Navigasi Dasar:**
    *   Buka `lib/src/presentation/features/dashboard/screens/dashboard_screen.dart`.
    *   Pada `FloatingActionButton`, pastikan `onPressed` mengarahkan ke halaman form transaksi:
        ```dart
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const TransactionFormScreen()),
          );
        },
        ```
    *   Tambahkan tombol atau menu sementara di `DashboardScreen` untuk membuka `CategoryScreen`:
        ```dart
        // Di dalam AppBar di dashboard_screen.dart
        actions: [
          IconButton(
            icon: const Icon(Icons.category),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CategoryScreen()),
              );
            },
          ),
        ],
        ```
2.  **Atur Halaman Awal:**
    Buka `lib/main.dart` dan pastikan `DashboardScreen` adalah halaman `home` dari aplikasi.
    ```dart
    // lib/main.dart
    // ...
    class MyApp extends StatelessWidget {
      const MyApp({super.key});
      @override
      Widget build(BuildContext context) {
        return MaterialApp(
          title: 'Catatan Keuangan',
          theme: ThemeData(
            primarySwatch: Colors.blue,
          ),
          home: const DashboardScreen(), // Halaman utama
        );
      }
    }
    ```

**Verifikasi:** Jalankan aplikasi. Pastikan Anda bisa menavigasi dari Dashboard ke halaman Kategori dan halaman Tambah Transaksi, lalu kembali lagi.

---

#### **Langkah 2: Pengujian Manual End-to-End (E2E)**

Lakukan pengujian manual berdasarkan skenario alur pengguna utama. Catat setiap perilaku yang tidak terduga, error, atau masalah UI.

**Skenario Pengujian 1: Alur Lengkap Kategori & Transaksi (Happy Path)**

1.  **Buat Kategori Baru:**
    *   Buka aplikasi, navigasi ke halaman Kategori.
    *   Pilih tab "Pemasukan", klik tombol `+`.
    *   Masukkan nama "Gaji Bulanan", simpan. **Ekspektasi:** Kategori baru muncul di daftar Pemasukan.
    *   Pilih tab "Pengeluaran", klik tombol `+`.
    *   Masukkan nama "Transportasi", simpan. **Ekspektasi:** Kategori baru muncul di daftar Pengeluaran.

2.  **Buat Transaksi Pemasukan:**
    *   Kembali ke Dashboard, klik FAB `+`.
    *   Pilih tipe "Pemasukan". **Ekspektasi:** Dropdown Kategori hanya menampilkan "Gaji Bulanan".
    *   Pilih kategori "Gaji Bulanan".
    *   Isi jumlah (misal: 5000000) dan keterangan "Gaji Juli".
    *   Simpan. **Ekspektasi:** Halaman kembali ke Dashboard, `SnackBar` sukses muncul, dan transaksi "Gaji Juli" muncul di daftar paling atas.

3.  **Buat Transaksi Pengeluaran:**
    *   Klik FAB `+` lagi.
    *   Tipe "Pengeluaran" sudah terpilih. **Ekspektasi:** Dropdown Kategori hanya menampilkan "Transportasi".
    *   Pilih kategori "Transportasi".
    *   Isi jumlah (misal: 15000) dan keterangan "Naik ojek ke kantor".
    *   Simpan. **Ekspektasi:** Halaman kembali ke Dashboard, dan transaksi "Naik ojek ke kantor" muncul di daftar.

**Skenario Pengujian 2: Validasi & Kasus Tepi (Edge Cases)**

1.  **Form Kosong:**
    *   Buka form transaksi, langsung klik "Simpan". **Ekspektasi:** Validasi form harus gagal, menampilkan pesan error di bawah field Kategori dan Jumlah.
    *   Buka dialog tambah kategori, langsung klik "Simpan". **Ekspektasi:** Dialog tidak tertutup, mungkin menampilkan pesan error atau tidak melakukan apa-apa.

2.  **Integritas Data (ON DELETE RESTRICT):**
    *   Navigasi ke halaman Kategori.
    *   Coba hapus kategori "Gaji Bulanan" yang sudah digunakan oleh transaksi. **Ekspektasi:** Operasi harus gagal. Aplikasi idealnya menampilkan pesan error seperti "Kategori tidak bisa dihapus karena masih digunakan". *Catatan: Implementasi UI untuk pesan error ini mungkin belum ada, tetapi Anda bisa memeriksa log debug untuk melihat `Exception` dari Drift.*

---

#### **Langkah 3: Identifikasi Bug & Area untuk Refactoring**

Berdasarkan hasil pengujian, buat daftar perbaikan dan peningkatan.

**Contoh Bug yang Mungkin Ditemukan:**
*   Dropdown kategori tidak me-reset saat tipe transaksi diubah.
*   Format angka dan tanggal belum konsisten.
*   Aplikasi crash jika mencoba menyimpan jumlah dengan format non-numerik.
*   Setelah menyimpan transaksi, daftar di dashboard tidak langsung ter-update (ini menandakan masalah pada `StreamProvider`).

**Contoh Area untuk Refactoring:**
1.  **DRY (Don't Repeat Yourself) pada Kode Repository:**
    *   **Masalah:** Pola `try-catch` untuk membungkus hasil dalam `Either<Failure, T>` diulang-ulang di setiap method `add`, `update`, `delete` di `CategoryRepositoryImpl` dan `TransactionRepositoryImpl`.
    *   **Solusi:** Buat *high-order function* atau *mixin* di `lib/src/core/error/` yang menangani ini.
        ```dart
        // Contoh di failure.dart atau file helper baru
        Future<Either<Failure, T>> guard<T>(Future<T> Function() future) async {
          try {
            return Right(await future());
          } catch (e) {
            // Log error di sini jika perlu
            return Left(DatabaseFailure(e.toString()));
          }
        }

        // Penggunaan di repository:
        @override
        FutureVoid addCategory(String name, int type) {
          return guard(() async {
            // ... logika insert ke DAO ...
            return unit;
          });
        }
        ```
2.  **Pemisahan Logika Pengelompokan:**
    *   **Masalah:** Logika untuk mengelompokkan transaksi berdasarkan tanggal saat ini berada di dalam `build` method dari `TransactionListView`. Ini bisa menjadi tidak efisien jika daftar sangat panjang.
    *   **Solusi:** Pindahkan logika ini ke dalam provider. Buat `Provider` baru yang bergantung pada `transactionListProvider` dan tugasnya hanya mengubah `List<Transaction>` menjadi `Map<DateTime, List<Transaction>>`.
        ```dart
        // di dashboard_provider.dart
        @riverpod
        Map<DateTime, List<Transaction>> groupedTransactionList(GroupedTransactionListRef ref) {
          final transactions = ref.watch(transactionListProvider).valueOrNull ?? [];
          // ... logika pengelompokan di sini ...
          return groupedTransactions;
        }

        // Di widget, cukup watch provider baru ini:
        final groupedTransactions = ref.watch(groupedTransactionListProvider);
        ```
3.  **Magic Numbers/Strings:**
    *   **Masalah:** Penggunaan angka `0` untuk Pengeluaran dan `1` untuk Pemasukan tersebar di banyak file.
    *   **Solusi:** Buat file konstanta di `lib/src/core/constants/`.
        ```dart
        // lib/src/core/constants/transaction_type.dart
        class TransactionType {
          static const int expense = 0;
          static const int income = 1;
        }
        ```
    *   Gunakan `TransactionType.expense` di seluruh aplikasi, bukan `0`. Ini membuat kode lebih mudah dibaca dan di-maintain.

---

#### **Langkah 4: Implementasi Perbaikan**

Alokasikan sisa waktu di Hari 10 untuk menerapkan perbaikan bug yang paling kritis dan melakukan refactoring yang paling berdampak seperti yang diidentifikasi pada Langkah 3.

---

### **Git Commit Akhir (Hari 10)**

Karena hari ini adalah tentang perbaikan dan stabilisasi, pesan commit harus merefleksikan hal tersebut.

```bash
git add .
git commit -m "refactor(sprint1): Stabilize, test, and refactor MVP core features

This commit concludes Sprint 1 by focusing on integration, testing, and code quality improvements for the features developed over the last nine days. No new features were added.

Key activities performed:

1.  **Integration & Testing:**
    - Implemented temporary navigation to connect the Dashboard, Category, and Transaction Form screens.
    - Conducted end-to-end manual testing for the primary user flow: creating categories, creating transactions, and verifying a reactive update on the dashboard.
    - Tested edge cases, including form validation and data integrity constraints (ON DELETE RESTRICT).

2.  **Bug Fixes:**
    - (Opsional: Sebutkan bug spesifik yang diperbaiki, contoh:)
    - Fixed an issue where the category dropdown was not resetting upon changing the transaction type.
    - Added basic numeric validation for the transaction amount field.

3.  **Refactoring & Code Quality:**
    - Created a 'guard' utility function to centralize `try-catch` logic and reduce boilerplate in repository implementations.
    - Moved transaction grouping logic from the UI widget into a dedicated `groupedTransactionListProvider` for better separation of concerns.
    - Introduced a `TransactionType` constants class to eliminate magic numbers (0 for expense, 1 for income) across the codebase.

The codebase is now in a more stable and maintainable state, ready for the development of new features in Sprint 2."
```

Jika tidak ada perubahan kode yang signifikan (hanya pengujian), maka tidak perlu ada commit. Namun, hampir selalu ada perbaikan kecil atau refactoring yang bisa dilakukan, sehingga commit di atas sangat relevan.