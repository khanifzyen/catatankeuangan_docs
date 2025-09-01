### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 2 (Hari 1-2)**

**Tujuan Utama:** Membangun fondasi navigasi aplikasi menggunakan GoRouter dan mengimplementasikan logika serta UI untuk komponen ringkasan keuangan di halaman utama. Di akhir periode ini, aplikasi akan memiliki alur navigasi yang jelas dan dashboard yang fungsional.

---

### **Task S2-T01: Implementasi Navigasi (GoRouter)**

**Tujuan:** Mengganti navigasi sementara (`Navigator.push`) dengan sistem navigasi yang terpusat, deklaratif, dan berbasis URL menggunakan GoRouter.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.1):** Mendefinisikan rute-rute utama yang akan dibuat.
*   **SRS.md (Batasan C-3):** Menetapkan GoRouter sebagai solusi navigasi wajib.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Konfigurasi Router**
    Di dalam `lib/src/presentation/routing/`, buat file baru `app_router.dart`.
    ```dart
    // lib/src/presentation/routing/app_router.dart
    import 'package:flutter/material.dart';
    import 'package:go_router/go_router.dart';
    import 'package:riverpod_annotation/riverpod_annotation.dart';

    // Import semua screen yang akan menjadi tujuan navigasi
    import '../features/dashboard/screens/dashboard_screen.dart';
    import '../features/category/screens/category_screen.dart';
    import '../features/transaction/screens/transaction_form_screen.dart';

    part 'app_router.g.dart';

    // Enum untuk nama rute, agar type-safe dan menghindari typo
    enum AppRoute {
      dashboard,
      categories,
      addTransaction,
      editTransaction,
    }

    @Riverpod(keepAlive: true)
    GoRouter goRouter(GoRouterRef ref) {
      return GoRouter(
        initialLocation: '/',
        debugLogDiagnostics: true, // Berguna untuk debugging
        routes: [
          GoRoute(
            path: '/',
            name: AppRoute.dashboard.name,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/categories',
            name: AppRoute.categories.name,
            builder: (context, state) => const CategoryScreen(),
          ),
          GoRoute(
            path: '/add-transaction',
            name: AppRoute.addTransaction.name,
            builder: (context, state) => const TransactionFormScreen(),
          ),
          // Rute untuk edit akan ditambahkan nanti jika diperlukan path parameter
        ],
      );
    }
    ```

2.  **Integrasikan GoRouter ke `main.dart`**
    Buka `lib/main.dart` dan ganti `home` dengan konfigurasi router dari GoRouter.

    ```dart
    // lib/main.dart
    import 'package:flutter/material.dart';
    import 'package:flutter_riverpod/flutter_riverpod.dart';
    import 'package:intl/date_symbol_data_local.dart';
    import 'package:intl/intl.dart';

    // Import provider router yang baru dibuat
    import 'src/presentation/routing/app_router.dart';

    void main() async {
      // ... (kode inisialisasi intl tetap sama)
      runApp(
        const ProviderScope(child: MyApp()),
      );
    }

    // Ubah MyApp menjadi ConsumerWidget untuk bisa mengakses provider router
    class MyApp extends ConsumerWidget {
      const MyApp({super.key});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        final router = ref.watch(goRouterProvider);

        return MaterialApp.router(
          title: 'Catatan Keuangan',
          theme: ThemeData(
            // ... (tema Anda)
          ),
          debugShowCheckedModeBanner: false,
          // Gunakan routerConfig untuk mengintegrasikan GoRouter
          routerConfig: router,
        );
      }
    }
    ```

3.  **Perbarui Aksi Navigasi di Seluruh Aplikasi**
    Sekarang, ganti semua pemanggilan `Navigator.push(...)` dengan pemanggilan GoRouter yang sesuai.

    *   **Di `dashboard_screen.dart`:**
        ```dart
        // import 'package:go_router/go_router.dart';
        // import '../routing/app_router.dart';

        // Pada FAB onPressed:
        onPressed: () => context.pushNamed(AppRoute.addTransaction.name),

        // Pada tombol kategori di AppBar (jika masih ada):
        onPressed: () => context.pushNamed(AppRoute.categories.name),
        ```

    *   **Di `transaction_form_screen.dart` dan `category_screen.dart`:**
        Pemanggilan `Navigator.pop(context)` masih bisa digunakan untuk kembali. GoRouter menanganinya dengan baik. Namun, untuk navigasi maju, selalu gunakan `context.push/go`.

**Verifikasi & Hasil Akhir (Task S2-T01):**
*   Jalankan `flutter pub run build_runner build --delete-conflicting-outputs` untuk men-generate `app_router.g.dart`.
*   Jalankan aplikasi. Aplikasi harus dimulai di `DashboardScreen`.
*   Semua tombol navigasi (ke halaman Tambah Transaksi, ke Kategori) harus berfungsi dengan benar.
*   Tombol kembali (baik fisik maupun di AppBar) juga harus berfungsi.

---

### **Task S2-T02: Logika Bisnis: Kalkulasi Ringkasan**

**Tujuan:** Membuat provider yang menghitung total Pemasukan, Pengeluaran, dan Saldo berdasarkan daftar transaksi yang ada.

**Referensi Dokumen:**
*   **PRD.md (Fitur F2.1):** Mendefinisikan kebutuhan untuk menampilkan ringkasan.
*   **SDD.md (Bagian 3.1):** Pola penggunaan Riverpod, di mana provider dapat bergantung pada provider lain.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Model Data untuk Ringkasan**
    Ini akan membuat state kita lebih terstruktur. Buat file `summary_data.dart` di `lib/src/domain/entities/`.
    ```dart
    // lib/src/domain/entities/summary_data.dart
    import 'package:freezed_annotation/freezed_annotation.dart';

    part 'summary_data.freezed.dart';

    @freezed
    class SummaryData with _$SummaryData {
      const factory SummaryData({
        required int totalIncome,
        required int totalExpense,
        required int balance,
      }) = _SummaryData;
    }
    ```

2.  **Buat Provider untuk Kalkulasi Ringkasan**
    Buka `lib/src/presentation/features/dashboard/providers/dashboard_provider.dart`. Tambahkan provider baru yang bergantung pada `transactionListProvider`.

    ```dart
    // lib/src/presentation/features/dashboard/providers/dashboard_provider.dart
    // ... (import lainnya) ...
    import '../../../../domain/entities/summary_data.dart';
    import '../../../../core/constants/transaction_type.dart';

    // ... (provider dateRangeFilterProvider dan transactionListProvider tetap ada) ...

    @riverpod
    SummaryData summaryData(SummaryDataRef ref) {
      // Tonton provider daftar transaksi
      final transactionsAsync = ref.watch(transactionListProvider);
      
      // Ambil daftar transaksi dari state async. Jika masih loading atau error, kembalikan nilai default.
      final transactions = transactionsAsync.valueOrNull ?? [];

      int totalIncome = 0;
      int totalExpense = 0;

      for (final tx in transactions) {
        if (tx.type == TransactionType.income) {
          totalIncome += tx.amount;
        } else {
          totalExpense += tx.amount;
        }
      }

      return SummaryData(
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        balance: totalIncome - totalExpense,
      );
    }
    ```

**Verifikasi & Hasil Akhir (Task S2-T02):**
*   Jalankan `build_runner` untuk men-generate file `summary_data.freezed.dart`.
*   Logika untuk menghitung ringkasan kini tersedia melalui `summaryDataProvider`. Provider ini akan secara otomatis menghitung ulang setiap kali daftar transaksi berubah.

---

### **Task S2-T03: UI: Komponen Ringkasan di Dashboard**

**Tujuan:** Membuat widget untuk menampilkan data ringkasan (Pemasukan, Pengeluaran, Saldo) di bagian atas `DashboardScreen`.

**Referensi Dokumen:**
*   **index.html & style.css:** Sebagai referensi visual untuk `summary-card`.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Widget `SummaryCard`**
    Di dalam `lib/src/presentation/features/dashboard/widgets/`, buat file baru `summary_card.dart`.
    ```dart
    // lib/src/presentation/features/dashboard/widgets/summary_card.dart
    import 'package:flutter/material.dart';
    import 'package:flutter_riverpod/flutter_riverpod.dart';
    import 'package:intl/intl.dart';

    import '../providers/dashboard_provider.dart';

    class SummaryCard extends ConsumerWidget {
      const SummaryCard({super.key});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        final summary = ref.watch(summaryDataProvider);
        final currencyFormatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
        
        return Card(
          margin: const EdgeInsets.all(16),
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _SummaryItem(
                  title: 'Pemasukan',
                  amount: summary.totalIncome,
                  color: Colors.green,
                  formatter: currencyFormatter,
                ),
                _SummaryItem(
                  title: 'Pengeluaran',
                  amount: summary.totalExpense,
                  color: Colors.red,
                  formatter: currencyFormatter,
                ),
                _SummaryItem(
                  title: 'Saldo',
                  amount: summary.balance,
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  formatter: currencyFormatter,
                ),
              ],
            ),
          ),
        );
      }
    }

    class _SummaryItem extends StatelessWidget {
      final String title;
      final int amount;
      final Color? color;
      final NumberFormat formatter;

      const _SummaryItem({
        required this.title,
        required this.amount,
        this.color,
        required this.formatter,
      });

      @override
      Widget build(BuildContext context) {
        return Column(
          children: [
            Text(title, style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 4),
            Text(
              formatter.format(amount),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        );
      }
    }
    ```

2.  **Tambahkan `SummaryCard` ke `DashboardScreen`**
    Buka `lib/src/presentation/features/dashboard/screens/dashboard_screen.dart` dan ganti placeholder dengan widget yang baru dibuat.

    ```dart
    // lib/src/presentation/features/dashboard/screens/dashboard_screen.dart
    // ... (import)
    import '../widgets/summary_card.dart'; // <-- Tambahkan import

    class DashboardScreen extends ConsumerWidget {
      // ...
      @override
      Widget build(BuildContext context, WidgetRef ref) {
        return Scaffold(
          // ... (AppBar)
          body: Column(
            children: [
              // Ganti placeholder dengan widget yang sebenarnya
              const SummaryCard(),
              // Daftar Transaksi
              const Expanded(
                child: TransactionListView(),
              ),
            ],
          ),
          // ... (FAB)
        );
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S2-T03):**
*   Jalankan aplikasi.
*   Di bagian atas `DashboardScreen`, sekarang harus ada kartu yang menampilkan total Pemasukan, Pengeluaran, dan Saldo.
*   **Pengujian Reaktivitas:** Tambahkan transaksi baru. Nilai-nilai di `SummaryCard` **harus langsung diperbarui** secara otomatis.

---

### **Git Commit Akhir (Hari 1-2)**

Setelah menyelesaikan semua tugas di atas dan memverifikasi fungsionalitasnya, gunakan pesan commit berikut.

```bash
git add .
git commit -m "feat(dashboard): Implement GoRouter navigation and summary card

This commit marks the beginning of Sprint 2 by establishing the application-wide navigation system and enhancing the dashboard with a reactive summary of financial data. It covers the work of tasks S2-T01, S2-T02, and S2-T03.

Key accomplishments include:

1.  **Navigation System (S2-T01):**
    - Implemented GoRouter for a centralized, declarative, and type-safe navigation system.
    - Defined primary application routes (`/`, `/categories`, `/add-transaction`) and integrated the router into the `MaterialApp`.
    - Replaced all temporary `Navigator.push` calls with `context.pushNamed`.

2.  **Summary Logic (S2-T02):**
    - Created a `SummaryData` entity to structure the summary state.
    - Implemented a `summaryDataProvider` that depends on the `transactionListProvider` to automatically calculate total income, expense, and balance.

3.  **UI for Summary (S2-T03):**
    - Developed a reusable `SummaryCard` widget to display the financial summary.
    - Integrated the card into the `DashboardScreen`, connecting it to the `summaryDataProvider` for real-time updates.

The application now has a robust navigation foundation and a more informative dashboard, significantly improving the user experience and preparing for further feature enhancements."
```