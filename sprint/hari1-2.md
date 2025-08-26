### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 1 (Hari 1-2)**

**Tujuan Utama:** Membangun fondasi proyek yang solid, meliputi struktur arsitektur, konfigurasi dependensi, skema database, dan model data inti. Di akhir hari kedua, proyek harus dapat berjalan (meskipun kosong), dan semua file yang dihasilkan oleh *code generator* (Drift, Freezed) harus berhasil dibuat tanpa error.

---

### **Task S1-T01: Setup Proyek & Konfigurasi Awal**

**Tujuan:** Membuat proyek Flutter baru, menginstal semua dependensi yang dibutuhkan, dan membangun struktur direktori sesuai dengan Software Design Document (SDD).

**Referensi Dokumen:**
*   **SRS.md (Bagian 2.4 - Batasan):** Sebagai daftar *tech stack* wajib.
*   **SDD.md (Bagian 6 - Struktur Proyek):** Sebagai cetak biru struktur direktori.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Proyek Flutter Baru**
    Buka terminal Anda dan jalankan perintah berikut. Gunakan nama paket yang deskriptif.
    ```bash
    flutter create --org com.ezhardigital --project-name catatan_keuangan_app .
    ```

2.  **Tambahkan Dependensi ke `pubspec.yaml`**
    Buka file `pubspec.yaml` dan tambahkan dependensi berikut. Dependensi ini diambil langsung dari batasan di SRS dan kebutuhan untuk implementasi arsitektur di SDD.

    ```yaml
    dependencies:
      flutter:
        sdk: flutter
      
      # State Management
      flutter_riverpod: ^2.5.1
      riverpod_annotation: ^2.3.5

      # Database
      drift: ^2.17.0
      sqlite3_flutter_libs: ^0.5.21
      path_provider: ^2.1.3
      path: ^1.9.0

      # Navigation
      go_router: ^14.0.2

      # Functional Programming
      fpdart: ^1.1.0

      # Immutable Data Models
      freezed_annotation: ^2.4.1
      
      # Utility
      intl: ^0.19.0 # Untuk formatting tanggal dan angka

      #JSON handling in dart
      json_annotation: 

    dev_dependencies:
      flutter_test:
        sdk: flutter
      
      # Code Generators
      build_runner: ^2.4.9
      riverpod_generator: ^2.4.0
      drift_dev: ^2.17.0
      freezed: ^2.5.2
      json_serializable:
      
      # Linter
      flutter_lints: ^3.0.0
      # Opsional: untuk aturan linting yang lebih ketat
      # custom_lint:
      # riverpod_lint:
    ```

3.  **Instal Dependensi**
    Setelah menyimpan `pubspec.yaml`, jalankan perintah ini di terminal:
    ```bash
    flutter pub get
    ```

4.  **Buat Struktur Direktori Proyek**
    Berdasarkan SDD, buat struktur folder berikut di dalam direktori `lib/`. Anda bisa membuat file kosong bernama `.gitkeep` di dalam setiap folder agar direktori kosong dapat di-commit ke Git.

    ```
    lib/
    └── src/
        ├── core/
        │   ├── constants/
        │   ├── error/
        │   └── utils/
        ├── data/
        │   ├── datasources/
        │   │   └── local/
        │   │       ├── daos/
        │   │       ├── tables/
        │   │       └── app_database.dart
        │   └── repositories/
        ├── domain/
        │   ├── entities/
        │   └── repositories/
        └── presentation/
            ├── features/
            │   ├── dashboard/
            │   └── transaction/
            ├── global_widgets/
            └── routing/
    ```

5.  **Konfigurasi Linter (Opsional tapi Sangat Direkomendasikan)**
    Buat file `analysis_options.yaml` di root proyek jika belum ada, dan pastikan isinya minimal seperti ini untuk menjaga kualitas kode:
    ```yaml
    include: package:flutter_lints/flutter.yaml

    linter:
      rules:
        # Tambahkan aturan custom jika diperlukan
        prefer_const_constructors: true
    ```

**Verifikasi & Hasil Akhir (Task S1-T01):**
*   Proyek dapat dijalankan menggunakan `flutter run` dan menampilkan aplikasi Flutter default tanpa error.
*   Semua dependensi terinstal dengan benar (periksa `pubspec.lock`).
*   Struktur direktori di dalam `lib/src` sesuai persis dengan yang didefinisikan di atas.

---

### **Task S1-T02: Desain & Implementasi Database (Drift)**

**Tujuan:** Menerjemahkan skema database konseptual dari ERD.md ke dalam kode Dart menggunakan Drift.

**Referensi Dokumen:**
*   **ERD.md:** Ini adalah **sumber kebenaran utama** untuk struktur tabel, nama kolom, tipe data, dan constraint.
*   **SDD.md (Bagian 3.3 & 4):** Menjelaskan peran Drift dalam Data Layer.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Definisi Tabel**
    Di dalam direktori `lib/src/data/datasources/local/tables/`, buat tiga file baru:
    *   `categories.dart`
    *   `transactions.dart`
    *   `settings.dart`

2.  **Implementasikan Kode Tabel `Categories`**
    Buka `categories.dart` dan tulis kode berikut, sesuai dengan ERD:
    ```dart
    // lib/src/data/datasources/local/tables/categories.dart
    import 'package:drift/drift.dart';

    class Categories extends Table {
      IntColumn get id => integer().autoIncrement()();
      TextColumn get name => text()();
      IntColumn get type => integer()(); // 0: Pengeluaran, 1: Pemasukan
      DateTimeColumn get createdAt => dateTime().named('created_at')();

      // Constraint: nama kategori harus unik per tipe
      @override
      Set<Column> get primaryKey => {id};

      @override
      List<String> get customConstraints => [
        'UNIQUE (name, type)'
      ];
    }
    ```

3.  **Implementasikan Kode Tabel `Transactions`**
    Buka `transactions.dart` dan tulis kode berikut. Perhatikan implementasi **Foreign Key** dan **On Delete Rule** yang krusial.
    ```dart
    // lib/src/data/datasources/local/tables/transactions.dart
    import 'package:drift/drift.dart';
    import 'categories.dart';

    class Transactions extends Table {
      IntColumn get id => integer().autoIncrement()();
      TextColumn get description => text()();
      IntColumn get amount => integer()();
      IntColumn get type => integer()(); // 0: Pengeluaran, 1: Pemasukan
      DateTimeColumn get transactionDate => dateTime().named('transaction_date')();
      
      // Foreign Key ke tabel Categories
      IntColumn get categoryId => integer()
          .named('category_id')
          .references(Categories, #id, onDelete: KeyAction.restrict)();

      DateTimeColumn get createdAt => dateTime().named('created_at')();
      DateTimeColumn get updatedAt => dateTime().named('updated_at')();
    }
    ```
    *   **Penting:** `onDelete: KeyAction.restrict` secara eksplisit menerapkan aturan bisnis dari ERD.md untuk mencegah penghapusan kategori yang masih digunakan.

4.  **Implementasikan Kode Tabel `Settings`**
    Buka `settings.dart` untuk tabel key-value.
    ```dart
    // lib/src/data/datasources/local/tables/settings.dart
    import 'package:drift/drift.dart';

    class Settings extends Table {
      TextColumn get key => text()();
      TextColumn get value => text()();

      @override
      Set<Column> get primaryKey => {key};
    }
    ```

5.  **Buat Class Database Utama (`AppDatabase`)**
    Buka file `lib/src/data/datasources/local/app_database.dart` dan hubungkan semua tabel.
    ```dart
    // lib/src/data/datasources/local/app_database.dart
    import 'dart:io';

    import 'package:drift/drift.dart';
    import 'package:drift/native.dart';
    import 'package:path_provider/path_provider.dart';
    import 'package:path/path.dart' as p;

    // Impor tabel-tabel yang sudah dibuat
    import 'tables/categories.dart';
    import 'tables/transactions.dart';
    import 'tables/settings.dart';

    // Ini akan men-generate file 'app_database.g.dart'
    part 'app_database.g.dart';

    @DriftDatabase(tables: [Categories, Transactions, Settings])
    class AppDatabase extends _$AppDatabase {
      AppDatabase() : super(_openConnection());

      @override
      int get schemaVersion => 1;
    }

    LazyDatabase _openConnection() {
      return LazyDatabase(() async {
        final dbFolder = await getApplicationDocumentsDirectory();
        final file = File(p.join(dbFolder.path, 'db.sqlite'));
        return NativeDatabase.createInBackground(file);
      });
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T02):**
*   Jalankan *code generator* dari terminal:
    ```bash
    flutter pub run build_runner build --delete-conflicting-outputs
    ```
*   Pastikan perintah di atas berjalan sukses dan file `app_database.g.dart` telah dibuat di dalam direktori yang sama dengan `app_database.dart` tanpa ada error.

---

### **Task S1-T03: Pembuatan Model Data (Freezed)**

**Tujuan:** Membuat class *entity* yang immutable untuk merepresentasikan data di dalam Domain Layer.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.2 - Entities):** Menyebutkan model apa saja yang perlu dibuat.
*   **ERD.md:** Model harus merefleksikan struktur tabel untuk konsistensi.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Entity**
    Di dalam direktori `lib/src/domain/entities/`, buat dua file baru:
    *   `category.dart`
    *   `transaction.dart`

2.  **Implementasikan Model `Category` dengan Freezed**
    Buka `category.dart` dan tulis kode berikut:
    ```dart
    // lib/src/domain/entities/category.dart
    import 'package:freezed_annotation/freezed_annotation.dart';

    part 'category.freezed.dart';
    part 'category.g.dart';

    @freezed
    class Category with _$Category {
      const factory Category({
        required int id,
        required String name,
        required int type, // 0: Pengeluaran, 1: Pemasukan
        required DateTime createdAt,
      }) = _Category;

      factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
    }
    ```

3.  **Implementasikan Model `Transaction` dengan Freezed**
    Buka `transaction.dart` dan tulis kode berikut:
    ```dart
    // lib/src/domain/entities/transaction.dart
    import 'package:freezed_annotation/freezed_annotation.dart';

    part 'transaction.freezed.dart';
    part 'transaction.g.dart';

    @freezed
    class Transaction with _$Transaction {
      const factory Transaction({
        required int id,
        required String description,
        required int amount,
        required int type,
        required DateTime transactionDate,
        required int categoryId,
        required DateTime createdAt,
        required DateTime updatedAt,
      }) = _Transaction;

      factory Transaction.fromJson(Map<String, dynamic> json) => _$TransactionFromJson(json);
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T03):**
*   Jalankan kembali *code generator*:
    ```bash
    flutter pub run build_runner build --delete-conflicting-outputs
    ```
*   Pastikan file `category.freezed.dart`, `category.g.dart`, `transaction.freezed.dart`, dan `transaction.g.dart` berhasil dibuat di direktori `lib/src/domain/entities/` tanpa error.
*   Proyek harus tetap dapat di-compile dan dijalankan.

---
**Ringkasan Pencapaian Hari 1-2:**
Anda telah berhasil membangun fondasi yang kokoh untuk aplikasi. Proyek kini memiliki arsitektur yang jelas, semua dependensi terpasang, skema database terdefinisi dan siap digunakan, serta model data yang aman (immutable). Anda siap untuk melanjutkan ke hari 3-4 untuk membangun lapisan akses data (Repository dan DAO).