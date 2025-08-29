### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 1 (Hari 5-7)**

**Tujuan Utama:** Mengimplementasikan fungsionalitas CRUD (Create, Read, Update, Delete) penuh untuk transaksi. Ini mencakup pembuatan lapisan akses data, perancangan UI form yang fungsional, dan menghubungkan semuanya dengan state management untuk menyimpan dan mengedit catatan keuangan.

---

### **Task S1-T07: Implementasi Repository & DAO (Transaksi)**

**Tujuan:** Membangun lapisan akses data untuk entitas `Transaction`, termasuk query kompleks untuk memfilter berdasarkan rentang tanggal.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.2, 3.3, 5):** Panduan untuk struktur Repository, DAO, dan strategi error handling.
*   **ERD.md:** Skema tabel `Transactions` dan relasinya dengan `Categories`.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Transaction DAO**
    DAO ini akan berisi query-query spesifik untuk transaksi. Buat file `transaction_dao.dart` di `lib/src/data/datasources/local/daos/`.
    ```dart
    // lib/src/data/datasources/local/daos/transaction_dao.dart
    import 'package:drift/drift.dart';
    import 'package:flutter/material.dart'; // Untuk DateTimeRange

    import '../app_database.dart';
    import '../tables/transactions.dart';

    part 'transaction_dao.g.dart';

    @DriftAccessor(tables: [Transactions])
    class TransactionDao extends DatabaseAccessor<AppDatabase> with _$TransactionDaoMixin {
      TransactionDao(super.db);

      // READ: Mengambil stream transaksi dalam rentang tanggal tertentu
      Stream<List<Transaction>> watchTransactions(DateTimeRange range) {
        final query = select(transactions)
          ..where((t) => t.transactionDate.isBetween(
                Constant(range.start),
                Constant(range.end),
              ))
          ..orderBy([(t) => OrderingTerm(expression: t.transactionDate, mode: OrderingMode.desc)]);
        return query.watch();
      }

      // CREATE: Menambah transaksi baru
      Future<void> addTransaction(TransactionsCompanion entry) {
        return into(transactions).insert(entry);
      }

      // UPDATE: Mengubah transaksi yang ada
      Future<void> updateTransaction(Transaction entry) {
        return update(transactions).replace(entry);
      }

      // DELETE: Menghapus transaksi
      Future<void> deleteTransaction(int id) {
        return (delete(transactions)..where((t) => t.id.equals(id))).go();
      }
    }
    ```

2.  **Hubungkan DAO ke `AppDatabase`**
    Buka `app_database.dart` dan daftarkan `TransactionDao`.
    ```dart
    // lib/src/data/datasources/local/app_database.dart
    // ... (imports) ...
    import 'daos/transaction_dao.dart'; // <-- Tambahkan import ini

    // Ubah anotasi @DriftDatabase
    @DriftDatabase(tables: [Categories, Transactions, Settings], daos: [CategoryDao, TransactionDao]) // <-- Tambahkan TransactionDao
    class AppDatabase extends _$AppDatabase {
      // ... (isi class) ...
    }
    ```

3.  **Buat Abstract Repository (Kontrak) di Domain Layer**
    Buat file `transaction_repository.dart` di `lib/src/domain/repositories/`.
    ```dart
    // lib/src/domain/repositories/transaction_repository.dart
    import 'package:flutter/material.dart';
    import '../../core/error/failure.dart';
    import '../entities/transaction.dart' as entity;

    abstract class ITransactionRepository {
      Stream<List<entity.Transaction>> watchTransactions(DateTimeRange range);
      FutureVoid addTransaction(entity.Transaction transaction);
      FutureVoid updateTransaction(entity.Transaction transaction);
      FutureVoid deleteTransaction(int id);
    }
    ```

4.  **Implementasikan Concrete Repository di Data Layer**
    Buat file `transaction_repository_impl.dart` di `lib/src/data/repositories/`.
    ```dart
    // lib/src/data/repositories/transaction_repository_impl.dart
    import 'package:drift/drift.dart' hide Column;
    import 'package:flutter/material.dart';
    import 'package:fpdart/fpdart.dart';

    import '../../core/error/failure.dart';
    import '../../domain/entities/transaction.dart' as entity;
    import '../../domain/repositories/transaction_repository.dart';
    import '../datasources/local/app_database.dart';
    import '../datasources/local/daos/transaction_dao.dart';

    class TransactionRepositoryImpl implements ITransactionRepository {
      final TransactionDao _dao;

      TransactionRepositoryImpl(this._dao);

      @override
      Stream<List<entity.Transaction>> watchTransactions(DateTimeRange range) {
        return _dao.watchTransactions(range).map(
              (dbTransactions) => dbTransactions.map(_mapDbTransactionToEntity).toList(),
            );
      }
      
      @override
      FutureVoid addTransaction(entity.Transaction transaction) async {
        try {
          final entry = _mapEntityToDbCompanion(transaction);
          await _dao.addTransaction(entry);
          return right(unit);
        } catch (e) {
          return left(DatabaseFailure('Gagal menyimpan transaksi: $e'));
        }
      }

      // ... Implementasikan updateTransaction dan deleteTransaction dengan pola yang sama ...

      // Helper untuk mapping
      entity.Transaction _mapDbTransactionToEntity(Transaction dbTransaction) {
        return entity.Transaction(
          // ... mapping semua field
        );
      }

      TransactionsCompanion _mapEntityToDbCompanion(entity.Transaction transaction) {
        return TransactionsCompanion(
          // ... mapping semua field, gunakan Value() untuk setiap field
        );
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T07):**
*   Jalankan `flutter pub run build_runner build --delete-conflicting-outputs`. Pastikan `transaction_dao.g.dart` terbuat dan `app_database.g.dart` ter-update tanpa error.
*   Lapisan data untuk Transaksi siap digunakan.

---

### **Task S1-T08: UI: Halaman Tambah/Edit Transaksi**

**Tujuan:** Membuat UI form untuk menambah dan mengedit transaksi, termasuk input tanggal dan dropdown kategori yang dinamis.

**Referensi Dokumen:**
*   **tambah-transaksi.html & style.css:** Sebagai referensi visual utama.
*   **SDD.md (Bagian 3.1):** Panduan struktur UI.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Screen**
    Buat file `transaction_form_screen.dart` di `lib/src/presentation/features/transaction/screens/`.

2.  **Buat Kerangka Screen**
    Screen ini sebaiknya `ConsumerStatefulWidget` karena kita perlu `TextEditingController` (state lokal) dan interaksi dengan Riverpod.
    ```dart
    // lib/src/presentation/features/transaction/screens/transaction_form_screen.dart
    import 'package:flutter/material.dart';
    import 'package:flutter_riverpod/flutter_riverpod.dart';

    class TransactionFormScreen extends ConsumerStatefulWidget {
      // final Transaction? transaction; // Untuk mode edit
      const TransactionFormScreen({super.key});

      @override
      ConsumerState<TransactionFormScreen> createState() => _TransactionFormScreenState();
    }

    class _TransactionFormScreenState extends ConsumerState<TransactionFormScreen> {
      final _formKey = GlobalKey<FormState>();
      final _amountController = TextEditingController();
      final _descriptionController = TextEditingController();

      // State untuk input lainnya
      DateTime _selectedDate = DateTime.now();
      int? _selectedCategoryId;
      int _transactionType = 0; // 0: Pengeluaran, 1: Pemasukan

      // ... initState, dispose ...

      @override
      Widget build(BuildContext context) {
        return Scaffold(
          appBar: AppBar(title: const Text('Buat Transaksi')),
          body: Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Akan kita isi dengan widget form
              ],
            ),
          ),
        );
      }
    }
    ```

3.  **Implementasikan Widget Input Form**
    Tambahkan widget-widget ini ke dalam `children` dari `ListView`.

    *   **Type Switcher (Pengeluaran/Pemasukan):**
        ```dart
        SegmentedButton<int>(
          segments: const [
            ButtonSegment(value: 0, label: Text('Pengeluaran')),
            ButtonSegment(value: 1, label: Text('Pemasukan')),
          ],
          selected: {_transactionType},
          onSelectionChanged: (newSelection) {
            setState(() {
              _transactionType = newSelection.first;
              _selectedCategoryId = null; // Reset pilihan kategori
            });
          },
        ),
        ```

    *   **DatePicker:**
        ```dart
        TextFormField(
          decoration: const InputDecoration(labelText: 'Tanggal'),
          readOnly: true,
          controller: TextEditingController(text: DateFormat('d MMM yyyy').format(_selectedDate)),
          onTap: () async {
            final pickedDate = await showDatePicker(...);
            if (pickedDate != null) {
              setState(() => _selectedDate = pickedDate);
            }
          },
        ),
        ```

    *   **Dropdown Kategori (Dinamis):**
        Ini adalah bagian paling penting. Kita akan me-watch provider kategori yang sudah dibuat sebelumnya.
        ```dart
        // Watch provider kategori berdasarkan tipe transaksi yang dipilih
        final categoriesAsync = ref.watch(categoryListProvider(_transactionType));

        categoriesAsync.when(
          data: (categories) => DropdownButtonFormField<int>(
            value: _selectedCategoryId,
            hint: const Text('Pilih Kategori'),
            items: categories.map((cat) => DropdownMenuItem(value: cat.id, child: Text(cat.name))).toList(),
            onChanged: (value) => setState(() => _selectedCategoryId = value),
            validator: (value) => value == null ? 'Kategori harus dipilih' : null,
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, s) => Text('Gagal memuat kategori: $e'),
        )
        ```

    *   **Input Jumlah dan Keterangan:**
        Gunakan `TextFormField` standar dengan `_amountController` dan `_descriptionController`. Tambahkan validasi yang sesuai (misalnya, jumlah tidak boleh kosong dan harus numerik).

    *   **Tombol Simpan:**
        ```dart
        ElevatedButton(
          onPressed: () {
            // Logika penyimpanan akan diimplementasikan di Task S1-T09
          },
          child: const Text('Simpan'),
        )
        ```

**Verifikasi & Hasil Akhir (Task S1-T08):**
*   Halaman form dapat ditampilkan.
*   Date picker berfungsi.
*   Type switcher (Pengeluaran/Pemasukan) berfungsi dan **dropdown kategori secara otomatis me-refresh isinya** sesuai pilihan. Ini membuktikan reusabilitas provider dari modul lain.
*   Form dapat diisi, meskipun tombol "Simpan" belum berfungsi.

---

### **Task S1-T09: State Management (Riverpod) untuk Form Transaksi**

**Tujuan:** Menciptakan logika untuk memvalidasi dan menyimpan data dari form ke database, serta memberikan feedback (loading/error) kepada pengguna.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.1):** Pola penggunaan Riverpod untuk interaksi pengguna.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Provider untuk Repository Transaksi**
    Tambahkan provider ini ke `lib/src/presentation/features/transaction/providers/transaction_provider.dart` (buat file jika belum ada).
    ```dart
    // lib/src/presentation/features/transaction/providers/transaction_provider.dart
    import 'package:riverpod_annotation/riverpod_annotation.dart';

    // ... (import lain seperti DAO, AppDatabase dari category_provider) ...
    import '../../../../domain/repositories/transaction_repository.dart';

    part 'transaction_provider.g.dart';
    
    // Provider ini bergantung pada DAO
    @riverpod
    TransactionDao transactionDao(TransactionDaoRef ref) {
      return TransactionDao(ref.watch(appDatabaseProvider));
    }
    
    // Provider untuk repository
    @riverpod
    ITransactionRepository transactionRepository(TransactionRepositoryRef ref) {
      return TransactionRepositoryImpl(ref.watch(transactionDaoProvider));
    }
    ```

2.  **Buat Notifier untuk Mengelola Logika Form**
    Ini adalah pendekatan terbaik untuk state yang kompleks seperti form. Kita akan membuat `Notifier` untuk mengelola proses penyimpanan.
    ```dart
    // Lanjutan di file transaction_provider.dart
    import '../../../../domain/entities/transaction.dart' as entity;

    // State untuk Notifier
    @freezed
    class TransactionFormState with _$TransactionFormState {
      const factory TransactionFormState.initial() = _Initial;
      const factory TransactionFormState.loading() = _Loading;
      const factory TransactionFormState.success() = _Success;
      const factory TransactionFormState.error(String message) = _Error;
    }

    @riverpod
    class TransactionForm extends _$TransactionForm {
      @override
      TransactionFormState build() => const TransactionFormState.initial();

      Future<void> saveTransaction({required entity.Transaction transaction}) async {
        state = const TransactionFormState.loading();
        final repository = ref.read(transactionRepositoryProvider);
        
        // Asumsi ada method 'addTransaction' di repo, bisa diganti 'updateTransaction' jika mode edit
        final result = await repository.addTransaction(transaction);
        
        state = result.fold(
          (failure) => TransactionFormState.error(failure.message),
          (_) => const TransactionFormState.success(),
        );
      }
    }
    ```

3.  **Hubungkan UI Form dengan Notifier**
    Kembali ke `transaction_form_screen.dart`.

    *   **Panggil method `saveTransaction`:**
        Di `onPressed` pada `ElevatedButton`:
        ```dart
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            final newTransaction = entity.Transaction(
              // Buat objek transaction dari state controller
              // id bisa di-hardcode 0 untuk transaksi baru
            );

            ref.read(transactionFormProvider.notifier).saveTransaction(transaction: newTransaction);
          }
        },
        ```

    *   **Dengarkan perubahan state dari Notifier:**
        Untuk memberikan feedback seperti menutup halaman atau menampilkan error.
        ```dart
        // Di dalam build method _TransactionFormScreenState
        ref.listen<TransactionFormState>(transactionFormProvider, (previous, next) {
          next.whenOrNull(
            success: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Transaksi berhasil disimpan!')));
              Navigator.pop(context);
            },
            error: (message) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
            },
          );
        });
        ```

    *   **Tampilkan state `loading`:**
        Ubah `ElevatedButton` agar menampilkan `CircularProgressIndicator` saat loading.
        ```dart
        final formState = ref.watch(transactionFormProvider);

        // ...
        ElevatedButton(
          onPressed: formState is _Loading ? null : () { /* ... */ },
          child: formState is _Loading ? const CircularProgressIndicator() : const Text('Simpan'),
        )
        ```

**Verifikasi & Hasil Akhir (Task S1-T09):**
*   Jalankan `build_runner` untuk men-generate file provider yang baru.
*   Jalankan aplikasi, buka form transaksi.
*   Isi semua field, lalu klik "Simpan".
*   Tombol harus menampilkan indikator loading.
*   Setelah selesai, `SnackBar` sukses harus muncul dan halaman form tertutup.
*   Jika ada error (misalnya, validasi database gagal), `SnackBar` error harus muncul.
*   Fungsionalitas inti untuk menambah transaksi kini telah selesai sepenuhnya.