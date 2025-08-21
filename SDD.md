### **Software Design Document (SDD): Aplikasi Catatan Keuangan Sederhana**

*   **Versi:** 1.0
*   **Tanggal:** 21 Agustus 2025
*   **Author:** Akhmad Khanif Zyen
*   **Status:** Disetujui

---

### **1. Pendahuluan**

**1.1. Tujuan**
Dokumen ini menyediakan desain teknis tingkat tinggi dan rendah untuk "Aplikasi Catatan Keuangan Sederhana". Tujuannya adalah untuk menjadi panduan bagi tim pengembang dalam mengimplementasikan perangkat lunak sesuai dengan persyaratan yang tercantum dalam SRS v1.0. Dokumen ini merinci arsitektur perangkat lunak, desain komponen, desain data, dan strategi teknis lainnya.

**1.2. Ruang Lingkup**
Desain ini mencakup seluruh fungsionalitas yang didefinisikan dalam SRS, termasuk manajemen transaksi, pelaporan, utilitas, dan monetisasi. Desain ini berfokus pada stack teknologi yang telah ditentukan: Flutter, Riverpod, Go_Router, Drift, Freezed, dan fpdart.

### **2. Desain Arsitektur Sistem**

**2.1. Tinjauan Arsitektur**
Aplikasi ini akan mengadopsi arsitektur **Clean Architecture** yang dimodifikasi dan diadaptasi untuk Flutter. Arsitektur ini membagi aplikasi menjadi tiga lapisan utama yang independen: **Presentation**, **Domain**, dan **Data**.

**Aturan Ketergantungan (Dependency Rule):** Lapisan luar hanya boleh bergantung pada lapisan dalam. Ini berarti UI (Presentation) bergantung pada logika bisnis (Domain), dan logika bisnis (Domain) tidak tahu apa-apa tentang UI atau database.

```
+---------------------------------------------------+
|               Presentation Layer                  |
| (Flutter Widgets, Riverpod Providers, Go_Router)  |
+---------------------------------------------------+
                         |
                         v (depends on)
+---------------------------------------------------+
|                  Domain Layer                     |
| (Entities/Models, Use Cases, Abstract Repositories)|
+---------------------------------------------------+
                         |
                         v (depends on)
+---------------------------------------------------+
|                    Data Layer                     |
|  (Repositories Impl, Data Sources - Drift DB)     |
+---------------------------------------------------+
```

**2.2. Deskripsi Lapisan**

*   **Presentation Layer:** Bertanggung jawab atas semua yang dilihat dan diinteraksikan oleh pengguna.
    *   **Komponen:** Widgets/Screens (Flutter), State Management (Riverpod Providers), Navigation (Go_Router).
    *   **Tugas:** Menampilkan data dari Domain Layer, menangkap input pengguna, dan meneruskannya ke Domain Layer untuk diproses. Lapisan ini tidak mengandung logika bisnis.

*   **Domain Layer:** Jantung dari aplikasi. Berisi logika bisnis inti (business rules) dan entitas.
    *   **Komponen:** Entities (Model data menggunakan Freezed), Use Cases/Services (Logika bisnis spesifik), dan Abstract Repositories (Kontrak/interface untuk Data Layer).
    *   **Tugas:** Mengelola state dan logika aplikasi tanpa bergantung pada detail implementasi (UI atau database).

*   **Data Layer:** Bertanggung jawab atas persistensi dan pengambilan data.
    *   **Komponen:** Repository Implementations (Implementasi konkret dari kontrak di Domain Layer), Data Sources (DAO dari Drift yang berinteraksi langsung dengan database SQLite).
    *   **Tugas:** Mengambil data dari database lokal (Drift) atau sumber eksternal (API di masa depan) dan menyediakannya ke Domain Layer.

### **3. Desain Komponen Rinci**

**3.1. Presentation Layer**
*   **Struktur UI:** UI akan dibagi menjadi `screens` (halaman penuh) dan `widgets` (komponen yang dapat digunakan kembali).
*   **State Management (Riverpod):**
    *   Setiap `screen` akan menjadi `ConsumerWidget` atau `ConsumerStatefulWidget` untuk "mendengarkan" perubahan state dari provider.
    *   Interaksi pengguna (misalnya, menekan tombol simpan) akan memanggil method pada provider (`ref.read(provider.notifier).method()`).
    *   Data yang bersifat reaktif dari database (seperti daftar transaksi) akan diekspos menggunakan `StreamProvider`.
*   **Navigasi (Go_Router):**
    *   Semua rute aplikasi akan didefinisikan dalam satu file konfigurasi `app_router.dart`.
    *   Rute utama yang akan dibuat:
        *   `/`: Halaman Utama (Dashboard)
        *   `/add-transaction`: Halaman form tambah transaksi
        *   `/categories`: Halaman manajemen kategori
        *   `/settings`: Halaman pengaturan
        *   `/report`: Halaman laporan grafik
    *   Navigasi akan dilakukan secara deklaratif menggunakan `context.go('/path')` atau `context.push('/path')`.

**3.2. Domain Layer**
*   **Entities (Freezed):**
    *   `Transaction`: Model data untuk transaksi. Dibuat immutable dengan Freezed.
    *   `Category`: Model data untuk kategori.
    *   `AppSetting`: Model untuk representasi pengaturan.
*   **Abstract Repositories (Contracts):**
    *   `ITransactionRepository`: Mendefinisikan method seperti `watchTransactions(DateTimeRange range)`, `addTransaction(Transaction tx)`, `deleteTransaction(int id)`.
    *   `ICategoryRepository`: Mendefinisikan method seperti `watchCategories(CategoryType type)`, `addCategory(Category cat)`, etc.
    *   `ISettingsRepository`: Mendefinisikan method seperti `getSetting(String key)`, `saveSetting(String key, String value)`.

**3.3. Data Layer**
*   **Repository Implementations:**
    *   `TransactionRepositoryImpl`: Class yang mengimplementasikan `ITransactionRepository`. Class ini akan menerima instance dari Drift DAO (Data Source) melalui constructor.
    *   Setiap method di sini akan memanggil method DAO yang sesuai, menangani `Exception`, dan membungkus hasilnya dalam `Either<Failure, Success>` dari `fpdart`.
*   **Data Sources (Drift):**
    *   `AppDatabase`: Class utama yang dianotasi dengan `@DriftDatabase`. Ini akan mendaftarkan semua tabel dan DAO.
    *   **Tables:** File-file yang mendefinisikan skema tabel (`categories.dart`, `transactions.dart`, `settings.dart`) sesuai dengan desain database.
    *   **DAOs (Data Access Objects):** Class-class yang dianotasi dengan `@DriftAccessor`. Mereka akan berisi query kustom. Contoh: `TransactionDao` akan memiliki query untuk mengambil transaksi dalam rentang tanggal tertentu dan mengembalikannya sebagai `Stream`.

### **4. Desain Data (Database)**

*   **Implementasi:** Skema database yang telah dirancang akan diimplementasikan menggunakan class-class `Table` di Drift.
*   **Relasi:** Relasi `FOREIGN KEY` antara `Transactions` dan `Categories` akan didefinisikan dalam model tabel Drift.
*   **Aturan Integritas:** Aturan `ON DELETE RESTRICT` akan diimplementasikan pada `FOREIGN KEY` untuk mencegah penghapusan kategori yang sedang digunakan.
*   **Migrasi:** Drift akan menangani skema migrasi. Setiap perubahan pada struktur tabel setelah rilis awal akan memerlukan skema migrasi baru.

### **5. Strategi Penanganan Error (Error Handling)**

*   **Konsep:** Menggunakan `fpdart` untuk menghindari `try-catch` blocks yang berlebihan dan `Exception` yang tidak tertangani.
*   **Alur:**
    1.  **Data Layer:** Method di Repository akan mengembalikan `Future<Either<Failure, T>>`. Jika query database gagal, ia akan mengembalikan `Left(DatabaseFailure("Pesan Error"))`. Jika berhasil, ia akan mengembalikan `Right(data)`.
    2.  **Domain Layer:** Use cases akan meneruskan `Either` ini ke atas.
    3.  **Presentation Layer:** Provider Riverpod akan menerima `Either`. UI (Widget) akan melakukan `pattern matching` pada hasilnya:
        *   Jika `Right`, tampilkan data.
        *   Jika `Left`, tampilkan pesan error kepada pengguna (misalnya, menggunakan `SnackBar` atau widget error).
*   **Tipe `Failure`:** Akan dibuat class `Failure` dasar dan beberapa turunan spesifik:
    *   `abstract class Failure {}`
    *   `class DatabaseFailure extends Failure { final String message; }`
    *   `class NetworkFailure extends Failure { final String message; }` (untuk masa depan).

### **6. Struktur Proyek (Direktori)**

Struktur direktori akan mengikuti pendekatan "Feature-First" untuk skalabilitas.

```
lib/
└── src/
    ├── core/                   # Kode inti & umum
    │   ├── constants/
    │   ├── error/              # Definisi Failure & Exceptions
    │   ├── usecases/           # Definisi Use Case dasar
    │   └── utils/              # Helper, formatters
    ├── data/
    │   ├── datasources/        # Implementasi Drift (Database, Tables, DAOs)
    │   └── repositories/       # Implementasi Repository
    ├── domain/
    │   ├── entities/           # Model data Freezed
    │   └── repositories/       # Kontrak/Interface Repository
    └── presentation/
        ├── features/           # Folder per fitur
        │   ├── dashboard/
        │   ├── transaction/
        │   │   ├── screens/
        │   │   ├── widgets/
        │   │   └── providers/
        │   ├── category/
        │   └── settings/
        ├── global_widgets/     # Widget yang dipakai di banyak fitur
        └── routing/
            └── app_router.dart # Konfigurasi Go_Router
```