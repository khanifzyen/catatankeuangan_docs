### **Dokumentasi Teknis & Panduan Pengerjaan: Sprint 1 (Hari 8-9)**

**Tujuan Utama:** Membangun antarmuka pengguna untuk Dashboard yang menampilkan daftar transaksi yang ada di database. UI ini harus *reaktif*, artinya ketika transaksi baru ditambahkan atau diubah, daftar di Dashboard harus diperbarui secara otomatis tanpa intervensi manual.

---

### **Task S1-T10: UI: Halaman Utama (Dashboard - Daftar Transaksi)**

**Tujuan:** Membuat UI untuk menampilkan daftar transaksi yang dikelompokkan berdasarkan tanggal, sesuai dengan prototipe `index.html`.

**Referensi Dokumen:**
*   **index.html & style.css:** Sebagai referensi visual utama, terutama untuk pengelompokan per tanggal (`group-header`).
*   **SDD.md (Bagian 3.1):** Panduan struktur UI menjadi `screens` dan `widgets`.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat Struktur Folder UI Dashboard**
    Di dalam `lib/src/presentation/features/`, buat folder `dashboard/` dengan subfolder `screens/` dan `widgets/`.

2.  **Buat Halaman Utama (Screen)**
    Buat file `dashboard_screen.dart` di `screens/`. Ini akan menjadi `ConsumerWidget` utama yang menampung semua elemen dashboard.
    ```dart
    // lib/src/presentation/features/dashboard/screens/dashboard_screen.dart
    import 'package:flutter/material.dart';
    import 'package:flutter_riverpod/flutter_riverpod.dart';

    // Import widget yang akan kita buat nanti
    import '../widgets/transaction_list_view.dart';

    class DashboardScreen extends ConsumerWidget {
      const DashboardScreen({super.key});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Dashboard'),
            // Aksi-aksi header akan ditambahkan di Sprint 2
          ),
          body: Column(
            children: [
              // Widget untuk Ringkasan (akan dibuat di Sprint 2)
              // Placeholder:
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Ringkasan Keuangan Akan Tampil di Sini', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              // Daftar Transaksi
              const Expanded(
                child: TransactionListView(),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () {
              // Navigasi ke halaman tambah transaksi (akan diimplementasikan dengan GoRouter)
              // Untuk sementara: Navigator.push(context, MaterialPageRoute(...));
            },
            child: const Icon(Icons.add),
          ),
        );
      }
    }
    ```

3.  **Buat Widget Daftar Transaksi yang Dapat Digunakan Kembali (`TransactionListView`)**
    Widget ini akan berisi logika utama untuk menampilkan dan mengelompokkan transaksi. Buat file `transaction_list_view.dart` di `widgets/`.
    ```dart
    // lib/src/presentation/features/dashboard/widgets/transaction_list_view.dart
    import 'package:flutter/material.dart';
    import 'package:flutter_riverpod/flutter_riverpod.dart';
    import 'package:intl/intl.dart';

    // Impor provider dan entity
    import '../../transaction/providers/transaction_provider.dart'; // Akan kita buat
    import '../../../../domain/entities/transaction.dart';

    class TransactionListView extends ConsumerWidget {
      const TransactionListView({super.key});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        // Data akan diambil dari provider di Task S1-T11
        // Untuk sekarang, kita gunakan data dummy untuk membangun UI
        final Map<DateTime, List<Transaction>> groupedTransactions = {}; // Dummy

        if (groupedTransactions.isEmpty) {
          return const Center(child: Text('Tidak ada transaksi untuk ditampilkan.'));
        }

        final dates = groupedTransactions.keys.toList();

        return ListView.builder(
          itemCount: dates.length,
          itemBuilder: (context, index) {
            final date = dates[index];
            final transactionsOnDate = groupedTransactions[date]!;
            
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Grup Tanggal
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(DateFormat('EEEE, d MMM yyyy').format(date), style: Theme.of(context).textTheme.titleMedium),
                ),
                // Daftar Transaksi untuk Tanggal Tersebut
                ...transactionsOnDate.map((tx) => TransactionListItem(transaction: tx)),
              ],
            );
          },
        );
      }
    }
    ```

4.  **Buat Widget Item Transaksi (`TransactionListItem`)**
    Ini adalah widget untuk satu baris transaksi. Buat file `transaction_list_item.dart` di `widgets/`.
    ```dart
    // lib/src/presentation/features/dashboard/widgets/transaction_list_item.dart
    import 'package:flutter/material.dart';
    import '../../../../domain/entities/transaction.dart';

    class TransactionListItem extends StatelessWidget {
      final Transaction transaction;
      const TransactionListItem({super.key, required this.transaction});

      @override
      Widget build(BuildContext context) {
        final isIncome = transaction.type == 1;
        final color = isIncome ? Colors.green : Colors.red;
        final sign = isIncome ? '+' : '-';

        return ListTile(
          leading: const Icon(Icons.category), // Ganti dengan ikon kategori nanti
          title: Text('Kategori ID: ${transaction.categoryId}'), // Ganti dengan nama kategori nanti
          subtitle: Text(transaction.description),
          trailing: Text(
            '$sign Rp${transaction.amount}',
            style: TextStyle(color: color, fontWeight: FontWeight.bold),
          ),
          onTap: () {
            // Logika untuk mengedit transaksi
          },
        );
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T10):**
*   `DashboardScreen` dapat ditampilkan (atur sebagai `home` di `main.dart` untuk sementara).
*   UI dasar dengan AppBar, FAB, dan placeholder untuk daftar transaksi telah dibuat.
*   Widget untuk daftar dan item individu telah terstruktur, siap untuk diisi dengan data nyata.

---

### **Task S1-T11: State Management (Riverpod) untuk Dashboard**

**Tujuan:** Membuat `StreamProvider` yang secara reaktif menyediakan daftar transaksi dari repository ke UI, sehingga UI selalu terbarui.

**Referensi Dokumen:**
*   **SDD.md (Bagian 3.1):** Menjelaskan penggunaan `StreamProvider` untuk data reaktif.

#### **Langkah-langkah Pengerjaan:**

1.  **Buat File Provider untuk Dashboard**
    Di dalam `lib/src/presentation/features/dashboard/`, buat folder `providers/` dan di dalamnya buat file `dashboard_provider.dart`.

2.  **Buat Provider untuk Mengelola State Filter Tanggal**
    Dashboard perlu tahu rentang tanggal mana yang harus ditampilkan. Kita buat `StateProvider` sederhana untuk ini, yang nantinya bisa dikembangkan menjadi `Notifier` yang lebih kompleks di Sprint 2.
    ```dart
    // lib/src/presentation/features/dashboard/providers/dashboard_provider.dart
    import 'package:flutter/material.dart';
    import 'package:riverpod_annotation/riverpod_annotation.dart';

    part 'dashboard_provider.g.dart';

    // Provider ini menyimpan rentang tanggal yang sedang aktif
    @riverpod
    class DateRangeFilter extends _$DateRangeFilter {
      @override
      DateTimeRange build() {
        // Default: menampilkan data untuk bulan ini
        final now = DateTime.now();
        final startOfMonth = DateTime(now.year, now.month, 1);
        final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
        return DateTimeRange(start: startOfMonth, end: endOfMonth);
      }

      void setRange(DateTimeRange newRange) {
        state = newRange;
      }
    }
    ```

3.  **Buat `StreamProvider` untuk Daftar Transaksi**
    Provider ini akan "mendengarkan" provider filter tanggal. Jika filter berubah, provider ini akan otomatis mengambil stream data yang baru.
    ```dart
    // Lanjutan di file dashboard_provider.dart
    import '../../transaction/providers/transaction_provider.dart'; // Provider repo transaksi
    import '../../../../domain/entities/transaction.dart';
    
    // Provider yang menyediakan stream daftar transaksi
    @riverpod
    Stream<List<Transaction>> transactionList(TransactionListRef ref) {
      final dateRange = ref.watch(dateRangeFilterProvider);
      final transactionRepo = ref.watch(transactionRepositoryProvider);
      return transactionRepo.watchTransactions(dateRange);
    }
    ```

4.  **Hubungkan `TransactionListView` dengan Provider**
    Sekarang kita ganti data dummy di `TransactionListView` dengan data nyata dari provider.
    ```dart
    // lib/src/presentation/features/dashboard/widgets/transaction_list_view.dart
    // ...
    // Ubah import provider
    import '../providers/dashboard_provider.dart';

    class TransactionListView extends ConsumerWidget {
      const TransactionListView({super.key});

      @override
      Widget build(BuildContext context, WidgetRef ref) {
        // Tonton provider stream transaksi
        final transactionsAsync = ref.watch(transactionListProvider);

        return transactionsAsync.when(
          data: (transactions) {
            if (transactions.isEmpty) {
              return const Center(child: Text('Tidak ada transaksi untuk ditampilkan.'));
            }

            // --- LOGIKA PENGELOMPOKKAN DATA ---
            final Map<DateTime, List<Transaction>> groupedTransactions = {};
            for (var tx in transactions) {
              final dateWithoutTime = DateTime(tx.transactionDate.year, tx.transactionDate.month, tx.transactionDate.day);
              if (groupedTransactions[dateWithoutTime] == null) {
                groupedTransactions[dateWithoutTime] = [];
              }
              groupedTransactions[dateWithoutTime]!.add(tx);
            }
            
            // UI tetap sama seperti sebelumnya, tapi sekarang menggunakan data nyata
            final dates = groupedTransactions.keys.toList();
            // ... ListView.builder ...
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Error: $err')),
        );
      }
    }
    ```

**Verifikasi & Hasil Akhir (Task S1-T11):**
*   Jalankan `flutter pub run build_runner build --delete-conflicting-outputs` untuk men-generate file provider yang baru.
*   Jalankan aplikasi. Halaman Dashboard sekarang harus menampilkan `CircularProgressIndicator`, lalu daftar transaksi yang sudah ada di database, dikelompokkan dengan benar per tanggal.
*   **Pengujian Kunci:** Buka halaman tambah transaksi (melalui FAB), tambahkan transaksi baru, lalu kembali ke Dashboard. Transaksi baru tersebut **harus langsung muncul di daftar** tanpa perlu me-refresh aplikasi. Ini membuktikan bahwa sistem reaktif `StreamProvider` telah berhasil diimplementasikan.

---

### **Git Commit Akhir (Hari 8-9)**

Setelah semua tugas di atas selesai dan diverifikasi, gunakan pesan commit berikut untuk merangkum pekerjaan Anda.

```bash
git add .
git commit -m "feat(dashboard): Implement reactive transaction list dashboard

This commit introduces the main dashboard screen, which displays a reactive list of user transactions. It covers the work from tasks S1-T10 and S1-T11, providing the primary view for the application.

Key accomplishments include:

1.  **UI Development for Dashboard (S1-T10):**
    - Created the main `DashboardScreen` scaffold.
    - Built a reusable `TransactionListView` widget that implements logic to group transactions by date, as per the visual prototype.
    - Designed a `TransactionListItem` widget to display individual transaction details.

2.  **State Management Integration (S1-T11):**
    - Established a `dateRangeFilterProvider` to manage the currently selected time period for fetching transactions.
    - Implemented a core `transactionListProvider` (`StreamProvider`) that listens to the date filter and reactively fetches a stream of transactions from the repository.
    - Connected the `TransactionListView` to this provider, ensuring the UI automatically updates when the underlying data in the database changes.

The result is a functional and reactive dashboard that serves as the central hub of the application, fulfilling a major requirement for the MVP."
```