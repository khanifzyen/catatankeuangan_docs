### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 1 (Hari 3-4)**

**Tujuan Utama:** Menghidupkan fungsionalitas manajemen kategori secara *end-to-end*. Ini melibatkan pembangunan lapisan akses data (Repository & DAO), pembuatan antarmuka pengguna (UI) untuk mengelola kategori, dan menghubungkan keduanya menggunakan state management (Riverpod) untuk menciptakan pengalaman yang reaktif.

---

### **Task S1-T04: Implementasi Repository & DAO (Kategori)**

**Tujuan:** Membangun jembatan antara Domain Layer dan Data Layer untuk entitas `Category`. Ini adalah implementasi pertama dari **Dependency Rule** Clean Architecture, di mana kita mendefinisikan kontrak di Domain dan mengimplementasikannya di Data.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.2, 3.3, 5):** Panduan utama untuk struktur Repository (abstrak & implementasi), DAO, dan strategi penanganan error menggunakan `fpdart`.
*   **ERD.md:** Skema tabel `Categories` yang akan diakses oleh DAO.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Class `Failure` untuk Error Handling**
    Sebelum membuat repository, kita perlu mendefinisikan struktur error. Buat file `failure.dart` di `lib/src/core/error/`.
    ```dart
    // lib/src/core/error/failure.dart
    import 'package:fpdart/fpdart.dart';

    abstract class Failure {
      final String message;
      const Failure(this.message);
    }

    class DatabaseFailure extends Failure {
      const DatabaseFailure(String message) : super(message);
    }

    // Tipe data untuk hasil yang bisa gagal
    typedef FutureEither<T> = Future<Either<Failure, T>>;
    typedef FutureVoid = FutureEither<void>;
    ```

2.  **Buat Category DAO (Data Access Object)**
    DAO adalah class yang berisi query langsung ke database Drift.
    Buat file `category_dao.dart` di `lib/src/data/datasources/local/daos/`.
    ```dart
    // lib/src/data/datasources/local/daos/category_dao.dart
    import 'package:drift/drift.dart';

    import '../app_database.dart';
    import '../tables/categories.dart';

    part 'category_dao.g.dart';

    @DriftAccessor(tables: [Categories])
    class CategoryDao extends DatabaseAccessor<AppDatabase> with _$CategoryDaoMixin {
      CategoryDao(super.db);

      // READ: Mengambil stream daftar kategori berdasarkan tipe (reaktif)
      Stream<List<Category>> watchCategories(int type) {
        return (select(categories)..where((c) => c.type.equals(type))).watch();
      }

      // CREATE: Menambah kategori baru
      Future<void> addCategory(CategoriesCompanion entry) {
        return into(categories).insert(entry);
      }

      // UPDATE: Mengubah kategori yang ada
      Future<void> updateCategory(Category entry) {
        return update(categories).replace(entry);
      }

      // DELETE: Menghapus kategori
      Future<void> deleteCategory(int id) {
        return (delete(categories)..where((c) => c.id.equals(id))).go();
      }
    }
    ```

3.  **Hubungkan DAO ke Database Utama**
    Buka `app_database.dart` dan tambahkan DAO yang baru dibuat.
    ```dart
    // lib/src/data/datasources/local/app_database.dart
    // ... (imports) ...
    import 'daos/category_dao.dart'; // <-- Tambahkan import ini

    // ... (kode lainnya) ...

    // Ubah anotasi @DriftDatabase
    @DriftDatabase(tables: [Categories, Transactions, Settings], daos: [CategoryDao]) // <-- Tambahkan daos
    class AppDatabase extends _$AppDatabase {
      // ... (constructor) ...
    }
    ```

4.  **Buat Abstract Repository (Kontrak) di Domain Layer**
    Ini adalah "kontrak" yang mendefinisikan *apa* yang bisa dilakukan terkait kategori, tanpa peduli *bagaimana* caranya. Buat file `category_repository.dart` di `lib/src/domain/repositories/`.
    ```dart
    // lib/src/domain/repositories/category_repository.dart
    import '../../core/error/failure.dart';
    import '../entities/category.dart' as entity; // Alias untuk menghindari konflik nama

    abstract class ICategoryRepository {
      Stream<List<entity.Category>> watchCategories(int type);
      FutureVoid addCategory(String name, int type);
      FutureVoid updateCategory(entity.Category category);
      FutureVoid deleteCategory(int id);
    }
    ```

5.  **Implementasikan Concrete Repository di Data Layer**
    Ini adalah implementasi nyata dari kontrak di atas, yang menggunakan DAO. Buat file `category_repository_impl.dart` di `lib/src/data/repositories/`.
    ```dart
    // lib/src/data/repositories/category_repository_impl.dart
    import 'package:drift/drift.dart';
    import 'package:fpdart/fpdart.dart';

    import '../../core/error/failure.dart';
    import '../../domain/entities/category.dart' as entity;
    import '../../domain/repositories/category_repository.dart';
    import '../datasources/local/app_database.dart';
    import '../datasources/local/daos/category_dao.dart';

    class CategoryRepositoryImpl implements ICategoryRepository {
      final CategoryDao _dao;

      CategoryRepositoryImpl(this._dao);

      @override
      Stream<List<entity.Category>> watchCategories(int type) {
        return _dao.watchCategories(type).map(
          (dbCategories) => dbCategories.map(
            (dbCategory) => entity.Category(
              id: dbCategory.id,
              name: dbCategory.name,
              type: dbCategory.type,
              createdAt: dbCategory.createdAt,
            ),
          ).toList(),
        );
      }

      @override
      FutureVoid addCategory(String name, int type) async {
        try {
          final entry = CategoriesCompanion(
            name: Value(name),
            type: Value(type),
            createdAt: Value(DateTime.now()),
          );
          await _dao.addCategory(entry);
          return right(unit); // 'unit' adalah representasi 'void' di fpdart
        } catch (e) {
          return left(DatabaseFailure('Gagal menambahkan kategori: $e'));
        }
      }

      // ... Implementasikan updateCategory dan deleteCategory dengan pola try-catch yang sama ...
      // (Kode lengkap dihilangkan untuk keringkasan)
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T04):**
*   Jalankan `flutter pub run build_runner build --delete-conflicting-outputs`. Pastikan `app_database.g.dart` dan `category_dao.g.dart` berhasil di-generate/di-update.
*   Proyek harus bisa di-compile tanpa error.
*   Lapisan data untuk Kategori kini siap digunakan oleh lapisan presentasi.

---

### **Task S1-T05: UI: Halaman Manajemen Kategori**

**Tujuan:** Membuat antarmuka pengguna (widget) untuk menampilkan, menambah, mengedit, dan menghapus kategori, sesuai dengan prototipe `kategori.html`.

**Referensi Dokumen:**
*   **kategori.html & style.css:** Sebagai referensi visual utama.
*   **SDD.md (Bagian 3.1):** Panduan struktur UI menjadi `screens` dan `widgets`.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Folder Struktur UI Kategori**
    Di dalam `lib/src/presentation/features/`, buat folder `category/` dengan subfolder `screens/` dan `widgets/`.

2.  **Buat Halaman Utama (Screen)**
    Buat file `category_screen.dart` di dalam `screens/`. Ini akan menjadi `StatefulWidget` (untuk mengelola `TabController`).
    ```dart
    // lib/src/presentation/features/category/screens/category_screen.dart
    import 'package:flutter/material.dart';
    // ... (import lainnya)

    class CategoryScreen extends StatefulWidget {
      const CategoryScreen({super.key});
      @override
      State<CategoryScreen> createState() => _CategoryScreenState();
    }

    class _CategoryScreenState extends State<CategoryScreen> with SingleTickerProviderStateMixin {
      late final TabController _tabController;

      @override
      void initState() {
        super.initState();
        _tabController = TabController(length: 2, vsync: this);
      }

      @override
      void dispose() {
        _tabController.dispose();
        super.dispose();
      }

      @override
      Widget build(BuildContext context) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Kategori'),
            actions: [
              IconButton(onPressed: () { /* Logika Tambah Kategori */ }, icon: const Icon(Icons.add)),
            ],
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Pengeluaran'),
                Tab(text: 'Pemasukan'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              // Placeholder untuk daftar kategori pengeluaran
              Center(child: Text('Daftar Pengeluaran')),
              // Placeholder untuk daftar kategori pemasukan
              Center(child: Text('Daftar Pemasukan')),
            ],
          ),
        );
      }
    }
    ```

3.  **Buat Widget Daftar Kategori**
    Buat file `category_list_view.dart` di `widgets/` untuk menampilkan daftar kategori.
    ```dart
    // lib/src/presentation/features/category/widgets/category_list_view.dart
    import 'package:flutter/material.dart';
    // import entity category ...

    class CategoryListView extends StatelessWidget {
      // Kita akan menerima daftar kategori dari provider nanti
      const CategoryListView({super.key});

      @override
      Widget build(BuildContext context) {
        // Logika sementara, akan diganti dengan data dari provider
        final categories = []; 

        if (categories.isEmpty) {
          return const Center(child: Text('Belum ada kategori.'));
        }

        return ListView.builder(
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final category = categories[index];
            return ListTile(
              title: Text(category.name),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(onPressed: () {}, icon: const Icon(Icons.edit)),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.delete)),
                ],
              ),
            );
          },
        );
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T05):**
*   Anda dapat menampilkan `CategoryScreen` (misalnya dengan mengaturnya sebagai `home` di `main.dart` untuk sementara).
*   UI harus menampilkan AppBar dengan judul, tombol tambah, dan dua tab (Pengeluaran & Pemasukan).
*   Mengklik tab harus mengganti konten yang ditampilkan di `TabBarView`.
*   Tampilan secara visual sudah menyerupai `kategori.html` meskipun belum fungsional.

---

### **Task S1-T06: State Management (Riverpod) untuk Kategori**

**Tujuan:** Menghubungkan UI yang telah dibuat dengan lapisan data menggunakan Riverpod, membuat aplikasi menjadi reaktif dan fungsional.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.1):** Menjelaskan penggunaan Riverpod, `ConsumerWidget`, `StreamProvider`, dan pola `ref.read`.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Provider**
    Di dalam `lib/src/presentation/features/category/`, buat folder `providers/` dan di dalamnya buat file `category_provider.dart`.

2.  **Buat Provider untuk Repository dan DAO**
    Kita akan menggunakan Riverpod Generator untuk kemudahan.
    ```dart
    // lib/src/presentation/features/category/providers/category_provider.dart
    import 'package:riverpod_annotation/riverpod_annotation.dart';

    import '../../../../data/datasources/local/app_database.dart';
    import '../../../../data/datasources/local/daos/category_dao.dart';
    import '../../../../data/repositories/category_repository_impl.dart';
    import '../../../../domain/repositories/category_repository.dart';

    part 'category_provider.g.dart';

    // 1. Provider untuk AppDatabase (singleton)
    @Riverpod(keepAlive: true)
    AppDatabase appDatabase(AppDatabaseRef ref) {
      return AppDatabase();
    }

    // 2. Provider untuk CategoryDao
    @riverpod
    CategoryDao categoryDao(CategoryDaoRef ref) {
      return CategoryDao(ref.watch(appDatabaseProvider));
    }

    // 3. Provider untuk ICategoryRepository
    @riverpod
    ICategoryRepository categoryRepository(CategoryRepositoryRef ref) {
      return CategoryRepositoryImpl(ref.watch(categoryDaoProvider));
    }
    ```

3.  **Buat `StreamProvider` untuk Daftar Kategori**
    Provider ini akan "mendengarkan" perubahan dari database.
    ```dart
    // Lanjutan di file category_provider.dart
    import '../../../../domain/entities/category.dart' as entity;
    
    // 4. StreamProvider untuk daftar kategori, menggunakan 'family' untuk memfilter berdasarkan tipe
    @riverpod
    Stream<List<entity.Category>> categoryList(CategoryListRef ref, int type) {
      final repository = ref.watch(categoryRepositoryProvider);
      return repository.watchCategories(type);
    }
    ```

4.  **Hubungkan UI dengan Provider**
    *   Ubah `CategoryScreen` menjadi `ConsumerWidget`.
    *   Ubah `CategoryListView` agar menerima `type` dan menjadi `ConsumerWidget`.
    *   Gunakan `ref.watch` untuk mendapatkan data dan menangani state `loading`, `error`, dan `data`.

    ```dart
    // lib/src/presentation/features/category/widgets/category_list_view.dart
    // Ubah menjadi ConsumerWidget
    class CategoryListView extends ConsumerWidget {
      final int type; // 0: Pengeluaran, 1: Pemasukan
      const CategoryListView({super.key, required this.type});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        // Tonton provider dengan tipe yang sesuai
        final categoriesAsync = ref.watch(categoryListProvider(type));

        return categoriesAsync.when(
          data: (categories) {
            if (categories.isEmpty) {
              return const Center(child: Text('Belum ada kategori.'));
            }
            return ListView.builder(
              // ... (kode list view seperti sebelumnya)
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Error: $err')),
        );
      }
    }

    // Di category_screen.dart, ganti placeholder di TabBarView
    TabBarView(
      controller: _tabController,
      children: const [
        CategoryListView(type: 0), // Pengeluaran
        CategoryListView(type: 1), // Pemasukan
      ],
    )
    ```

5.  **Implementasikan Logika Aksi (Tambah Kategori)**
    Tombol `+` di AppBar sekarang akan memicu dialog dan memanggil method di repository.

    ```dart
    // Di dalam onPressed IconButton di CategoryScreen
    onPressed: () {
      // Dapatkan tipe kategori yang sedang aktif dari TabController
      final currentType = _tabController.index;
      _showAddCategoryDialog(context, ref, currentType);
    }

    // Buat method helper _showAddCategoryDialog di dalam _CategoryScreenState
    void _showAddCategoryDialog(BuildContext context, WidgetRef ref, int type) {
      final controller = TextEditingController();
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Tambah Kategori Baru'),
          content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'Nama Kategori')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
            TextButton(
              onPressed: () async {
                final name = controller.text;
                if (name.isNotEmpty) {
                  // Panggil repository untuk menambahkan data
                  await ref.read(categoryRepositoryProvider).addCategory(name, type);
                  Navigator.pop(context);
                }
              },
              child: const Text('Simpan'),
            ),
          ],
        ),
      );
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T06):**
*   Jalankan `flutter pub run build_runner build --delete-conflicting-outputs` sekali lagi untuk men-generate file `category_provider.g.dart`.
*   Jalankan aplikasi. Halaman kategori kini harus menampilkan `CircularProgressIndicator` sesaat, lalu pesan "Belum ada kategori."
*   Klik tombol `+`, masukkan nama kategori, dan simpan. Kategori baru **harus langsung muncul di daftar yang benar** tanpa perlu me-refresh manual. Ini membuktikan bahwa `StreamProvider` bekerja dengan baik.
*   Logika untuk Edit dan Hapus dapat diimplementasikan dengan pola yang sama (menampilkan dialog konfirmasi/edit, lalu memanggil method di repository).