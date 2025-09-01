### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 2 (Hari 3-5)**

**Tujuan Utama:** Memberikan pengguna kontrol penuh atas rentang waktu data yang ditampilkan di Dashboard. Ini melibatkan implementasi logika filtering, pembuatan komponen UI untuk filter, dan pengelompokan visual daftar transaksi agar lebih mudah dibaca.

---

### **Task S2-T04: Logika Bisnis: Filter Periode Waktu**

**Tujuan:** Mengembangkan logika di dalam provider untuk dapat menerima dan memproses perubahan filter periode (Harian, Mingguan, Bulanan) dan memperbarui data yang ditampilkan.

**Referensi Dokumen:**
*   **PRD.md (Fitur F2.2):** Mendefinisikan kebutuhan filter periode dasar.
*   **SDD.md (Bagian 3.1):** Panduan penggunaan Riverpod untuk mengelola state.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Enum untuk Tipe Filter**
    Untuk menghindari *magic numbers* atau *strings*, kita definisikan tipe filter dalam sebuah enum. Buat file baru di `lib/src/core/constants/filter_type.dart`.
    ```dart
    // lib/src/core/constants/filter_type.dart
    enum FilterType {
      daily,
      weekly,
      monthly,
      yearly, // Kita tambahkan yearly sekalian
    }
    ```

2.  **Kembangkan `DateRangeFilter` Notifier**
    Kita akan mengubah `StateProvider` yang sederhana menjadi `Notifier` yang lebih canggih. Notifier ini akan menyimpan filter aktif (`FilterType`) dan tanggal referensi (`referenceDate`), lalu secara otomatis menghitung `DateTimeRange` yang sesuai.

    **Buka `lib/src/presentation/features/dashboard/providers/dashboard_provider.dart`**
    ```dart
    // lib/src/presentation/features/dashboard/providers/dashboard_provider.dart
    import 'package:flutter/material.dart';
    import 'package:riverpod_annotation.dart';
    import '../../../../core/constants/filter_type.dart';

    part 'dashboard_provider.g.dart';

    // State untuk Notifier kita
    @immutable
    class DateFilterState {
      final FilterType filterType;
      final DateTime referenceDate;

      const DateFilterState({
        required this.filterType,
        required this.referenceDate,
      });

      // Helper untuk menghitung DateTimeRange
      DateTimeRange get dateRange {
        switch (filterType) {
          case FilterType.daily:
            final start = DateTime(referenceDate.year, referenceDate.month, referenceDate.day);
            final end = DateTime(referenceDate.year, referenceDate.month, referenceDate.day, 23, 59, 59);
            return DateTimeRange(start: start, end: end);
          case FilterType.weekly:
            final startOfWeek = referenceDate.subtract(Duration(days: referenceDate.weekday - 1));
            final endOfWeek = startOfWeek.add(const Duration(days: 6, hours: 23, minutes: 59, seconds: 59));
            return DateTimeRange(start: startOfWeek, end: endOfWeek);
          case FilterType.monthly:
            final startOfMonth = DateTime(referenceDate.year, referenceDate.month, 1);
            final endOfMonth = DateTime(referenceDate.year, referenceDate.month + 1, 0, 23, 59, 59);
            return DateTimeRange(start: startOfMonth, end: endOfMonth);
          case FilterType.yearly:
            final startOfYear = DateTime(referenceDate.year, 1, 1);
            final endOfYear = DateTime(referenceDate.year, 12, 31, 23, 59, 59);
            return DateTimeRange(start: startOfYear, end: endOfYear);
        }
      }
    }
    
    // Ganti StateProvider menjadi NotifierProvider
    @riverpod
    class DateFilter extends _$DateFilter {
      @override
      DateFilterState build() {
        // State awal: filter bulanan untuk tanggal hari ini
        return DateFilterState(
          filterType: FilterType.monthly,
          referenceDate: DateTime.now(),
        );
      }

      void setFilterType(FilterType type) {
        state = DateFilterState(filterType: type, referenceDate: state.referenceDate);
      }
      
      void nextPeriod() {
        late DateTime newDate;
        switch (state.filterType) {
          case FilterType.daily:
            newDate = state.referenceDate.add(const Duration(days: 1));
            break;
          case FilterType.weekly:
            newDate = state.referenceDate.add(const Duration(days: 7));
            break;
          case FilterType.monthly:
            newDate = DateTime(state.referenceDate.year, state.referenceDate.month + 1, 1);
            break;
          case FilterType.yearly:
             newDate = DateTime(state.referenceDate.year + 1, 1, 1);
            break;
        }
        state = DateFilterState(filterType: state.filterType, referenceDate: newDate);
      }
      
      void previousPeriod() {
        late DateTime newDate;
        switch (state.filterType) {
          case FilterType.daily:
            newDate = state.referenceDate.subtract(const Duration(days: 1));
            break;
          case FilterType.weekly:
            newDate = state.referenceDate.subtract(const Duration(days: 7));
            break;
          case FilterType.monthly:
            newDate = DateTime(state.referenceDate.year, state.referenceDate.month - 1, 1);
            break;
          case FilterType.yearly:
            newDate = DateTime(state.referenceDate.year - 1, 1, 1);
            break;
        }
        state = DateFilterState(filterType: state.filterType, referenceDate: newDate);
      }
    }
    ```

3.  **Perbarui `transactionListProvider`**
    Provider ini sekarang harus bergantung pada `Notifier` yang baru.
    ```dart
    // Masih di dashboard_provider.dart
    @riverpod
    Stream<List<Transaction>> transactionList(TransactionListRef ref) {
      // Tonton Notifier, dan ambil dateRange dari state-nya
      final dateRange = ref.watch(dateFilterProvider).dateRange;
      final transactionRepo = ref.watch(transactionRepositoryProvider);
      return transactionRepo.watchTransactions(dateRange);
    }
    ```

**Verifikasi & Hasil Akhir (Task S2-T04):**
*   Jalankan `build_runner`.
*   Logika untuk mengelola state filter waktu kini sudah siap. `transactionListProvider` secara otomatis akan mengambil data yang benar setiap kali `DateFilter` Notifier mengubah state-nya.

---

### **Task S2-T05: UI: Komponen Filter di Dashboard**

**Tujuan:** Membuat `TabBar` untuk memilih filter periode (Harian, Mingguan, Bulanan) dan menghubungkannya dengan `DateFilter` Notifier.

**Referensi Dokumen:**
*   **index.html:** Referensi visual untuk `time-nav-tabs`.

#### **Langkah-langkah Pengerjaan:**

1.  **Ubah `DashboardScreen` menjadi `ConsumerStatefulWidget`**
    Kita memerlukan `TabController`, jadi kita ubah menjadi `Stateful`.
    **Buka `lib/src/presentation/features/dashboard/screens/dashboard_screen.dart`**
    ```dart
    // Ubah dari ConsumerWidget menjadi ConsumerStatefulWidget
    class DashboardScreen extends ConsumerStatefulWidget {
      const DashboardScreen({super.key});

      @override
      ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
    }

    class _DashboardScreenState extends ConsumerState<DashboardScreen> with SingleTickerProviderStateMixin {
      late final TabController _tabController;

      @override
      void initState() {
        super.initState();
        // 4 tab: Harian, Mingguan, Bulanan, Tahunan
        _tabController = TabController(length: 4, vsync: this);
        // Set tab awal sesuai state provider
        _tabController.index = ref.read(dateFilterProvider).filterType.index;
      }
      
      @override
      void dispose() {
        _tabController.dispose();
        super.dispose();
      }
      
      @override
      Widget build(BuildContext context) {
        // ... (kode build akan diisi di bawah)
      }
    }
    ```

2.  **Buat `AppBar` Dinamis dan `TabBar`**
    Di dalam `build` method dari `_DashboardScreenState`:
    ```dart
    // Di dalam build method _DashboardScreenState
    final dateFilterState = ref.watch(dateFilterProvider);
    final dateFilterNotifier = ref.read(dateFilterProvider.notifier);
    
    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onTap: () { /* TODO: Buka date picker */ },
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                // Tampilkan teks periode yang sesuai
                _getAppBarTitle(dateFilterState),
              ),
              const Icon(Icons.arrow_drop_down),
            ],
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: dateFilterNotifier.previousPeriod,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios),
            onPressed: dateFilterNotifier.nextPeriod,
          )
        ],
        bottom: TabBar(
          controller: _tabController,
          onTap: (index) {
            dateFilterNotifier.setFilterType(FilterType.values[index]);
          },
          tabs: const [
            Tab(text: 'Harian'),
            Tab(text: 'Mingguan'),
            Tab(text: 'Bulanan'),
            Tab(text: 'Tahunan'),
          ],
        ),
      ),
      body: Column(
        // ... (SummaryCard dan TransactionListView)
      ),
      // ... (FAB)
    );
    
    // Tambahkan method helper di dalam _DashboardScreenState
    String _getAppBarTitle(DateFilterState state) {
      final date = state.referenceDate;
      switch (state.filterType) {
        case FilterType.daily:
          return DateFormat.yMMMMEEEEd('id_ID').format(date);
        case FilterType.weekly:
          final start = state.dateRange.start;
          final end = state.dateRange.end;
          return '${DateFormat.d('id_ID').format(start)} - ${DateFormat.yMMMMd('id_ID').format(end)}';
        case FilterType.monthly:
          return DateFormat.yMMMM('id_ID').format(date);
        case FilterType.yearly:
          return DateFormat.y('id_ID').format(date);
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S2-T05):**
*   Jalankan aplikasi. Dashboard sekarang memiliki `AppBar` dengan navigasi periode (panah kiri/kanan) dan `TabBar`.
*   Mengklik tab (misal: "Harian") harus mengubah judul di `AppBar` dan **secara otomatis memfilter daftar transaksi dan `SummaryCard`**.
*   Mengklik panah kiri/kanan harus mengubah periode (misal: dari "Agustus 2025" ke "Juli 2025") dan juga memfilter ulang data.

---

### **Task S2-T06: UI: Pengelompokan Visual Transaksi**

**Tujuan:** Meningkatkan keterbacaan daftar transaksi dengan menambahkan header tanggal untuk setiap grup, seperti pada prototipe.

**Referensi Dokumen:**
*   **index.html:** Referensi untuk `group-header` dengan detail tanggal.

#### **Langkah-langkah Pengerjaan:**

Implementasi ini sebagian besar sudah kita lakukan di **Task S1-T11** saat membuat `TransactionListView`. Sekarang kita akan menyempurnakannya agar lebih mirip dengan prototipe, yaitu dengan menampilkan total harian di header grup.

**Buka `lib/src/presentation/features/dashboard/widgets/transaction_list_view.dart`**
```dart
// ... (imports)
import '../../../../domain/entities/transaction.dart';
import '../../../../core/constants/transaction_type.dart'; // Import TransactionType
import 'transaction_list_item.dart'; // Pastikan widget ini sudah dibuat

class TransactionListView extends ConsumerWidget {
  const TransactionListView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ... (ref.watch dan .when tetap sama) ...
    // Di dalam `data` callback dari `transactionsAsync.when`

    // ... (logika pengelompokan yang sudah ada) ...
    // final Map<DateTime, List<Transaction>> groupedTransactions = {};

    return ListView.builder(
      itemCount: dates.length,
      itemBuilder: (context, index) {
        final date = dates[index];
        final transactionsOnDate = groupedTransactions[date]!;
        
        // --- PENYEMPURNAAN DI SINI ---
        // Hitung total pemasukan dan pengeluaran harian
        int dailyIncome = 0;
        int dailyExpense = 0;
        for (final tx in transactionsOnDate) {
          if (tx.type == TransactionType.income) {
            dailyIncome += tx.amount;
          } else {
            dailyExpense += tx.amount;
          }
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Grup Tanggal yang Ditingkatkan
            _GroupHeader(
              date: date,
              dailyIncome: dailyIncome,
              dailyExpense: dailyExpense,
            ),
            // Daftar transaksi untuk tanggal tersebut
            ...transactionsOnDate.map((tx) => TransactionListItem(transaction: tx)),
          ],
        );
      },
    );
    // ...
  }
}

// Buat widget private baru untuk header agar lebih bersih
class _GroupHeader extends StatelessWidget {
  final DateTime date;
  final int dailyIncome;
  final int dailyExpense;

  const _GroupHeader({
    required this.date,
    required this.dailyIncome,
    required this.dailyExpense,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0);
    return Container(
      color: Colors.grey[200],
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            DateFormat.yMMMMEEEEd('id_ID').format(date),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Row(
            children: [
              if (dailyIncome > 0)
                Text(
                  '+${currencyFormatter.format(dailyIncome)}',
                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w600),
                ),
              const SizedBox(width: 8),
              if (dailyExpense > 0)
                Text(
                  '-${currencyFormatter.format(dailyExpense)}',
                  style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
                ),
            ],
          )
        ],
      ),
    );
  }
}
```

**Verifikasi & Hasil Akhir (Task S2-T06):**
*   Jalankan aplikasi.
*   Daftar transaksi sekarang harus memiliki header abu-abu untuk setiap tanggal.
*   Header tersebut harus menampilkan tanggal yang diformat dengan benar dan total pemasukan/pengeluaran untuk hari itu.

---

### **Git Commit Akhir (Hari 3-5)**

Setelah semua tugas di atas selesai dan diverifikasi, gunakan pesan commit berikut.

```bash
git add .
git commit -m "feat(dashboard): Implement time period filter and enhance UI

This commit significantly enhances the dashboard's functionality and user experience by adding a comprehensive time period filter and improving the visual presentation of the transaction list. It covers the work of tasks S2-T04, S2-T05, and S2-T06.

Key accomplishments include:

1.  **Filter Logic (S2-T04):**
    - Refactored the `dateRangeFilterProvider` into a more robust `DateFilter` Notifier.
    - The Notifier now manages the active filter type (Daily, Weekly, etc.) and reference date, automatically calculating the correct `DateTimeRange`.
    - Implemented logic for navigating to the next/previous period.

2.  **Filter UI Components (S2-T05):**
    - Added a `TabBar` to the `DashboardScreen` for selecting the filter type.
    - Implemented a dynamic `AppBar` that displays the current period and provides navigation controls (next/previous arrows).
    - The UI is now fully connected to the `DateFilter` Notifier, making the dashboard completely reactive to filter changes.

3.  **Visual Grouping (S2-T06):**
    - Enhanced the `TransactionListView` to display group headers for each date.
    - These headers now include a summary of the total income and expense for that specific day, improving data readability.

The dashboard is now a powerful and interactive tool, giving users fine-grained control over the data they see, fulfilling a major requirement of the PRD."
```