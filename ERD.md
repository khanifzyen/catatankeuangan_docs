### **Skema Database Konseptual**

Kita akan merancang 3 tabel utama:

1.  **`Categories`**: Untuk menyimpan semua kategori pemasukan dan pengeluaran.
2.  **`Transactions`**: Tabel inti yang mencatat setiap aktivitas keuangan.
3.  **`Settings`**: Tabel key-value untuk menyimpan preferensi pengguna.

---

### **1. Tabel: `Categories`**

Tabel ini berfungsi sebagai master data untuk kategori. Memisahkannya ke dalam tabel sendiri memungkinkan pengguna untuk mengelola (menambah/mengubah/menghapus) kategori tanpa mempengaruhi data transaksi secara langsung (prinsip normalisasi).

| Nama Kolom | Tipe Data | Constraint & Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | **PRIMARY KEY**, AUTOINCREMENT. Kunci unik untuk setiap kategori. | `1` |
| `name` | `TEXT` | **NOT NULL**, **UNIQUE** (within a type). Nama kategori yang ditampilkan ke pengguna. Sebaiknya unik per tipe agar tidak ada 2 kategori "Lain-lain" untuk pengeluaran. | `Makanan` |
| `type` | `INTEGER` | **NOT NULL**. Tipe kategori. **`0` untuk Pengeluaran**, **`1` untuk Pemasukan**. Ini penting untuk memfilter kategori di UI. | `0` |
| `created_at` | `DATETIME` | **NOT NULL**. Timestamp kapan kategori ini dibuat. Default ke waktu saat ini. | `2024-05-23 10:30:00`|

---

### **2. Tabel: `Transactions`**

Ini adalah tabel paling penting dan akan paling sering diakses. Tabel ini menyimpan catatan detail dari setiap transaksi.

| Nama Kolom | Tipe Data | Constraint & Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | **PRIMARY KEY**, AUTOINCREMENT. Kunci unik untuk setiap transaksi. | `101` |
| `description`| `TEXT` | **NOT NULL**. Keterangan atau deskripsi dari transaksi. | `Makan siang nasi padang`|
| `amount` | `INTEGER` | **NOT NULL**. Jumlah uang. **PENTING:** Disimpan sebagai integer (misal: Rp 25.000 disimpan sebagai `25000`) untuk menghindari masalah presisi floating point. | `25000` |
| `type` | `INTEGER` | **NOT NULL**. Tipe transaksi, sama seperti di tabel `Categories`. **`0` untuk Pengeluaran**, **`1` untuk Pemasukan**. | `0` |
| `transaction_date`| `DATETIME` | **NOT NULL**. Tanggal dan waktu transaksi terjadi. Ini akan menjadi kolom utama untuk filtering (harian, bulanan, dll). | `2024-05-23 12:15:00`|
| `category_id`| `INTEGER` | **NOT NULL**, **FOREIGN KEY** ke `Categories(id)`. Menghubungkan transaksi ini ke sebuah kategori. | `1` |
| `created_at` | `DATETIME` | **NOT NULL**. Timestamp kapan data ini dimasukkan ke database. | `2024-05-23 12:16:00`|
| `updated_at` | `DATETIME` | **NOT NULL**. Timestamp kapan data ini terakhir diubah. | `2024-05-23 12:16:00`|

---

### **3. Tabel: `Settings`**

Daripada membuat banyak kolom untuk setiap pengaturan, kita menggunakan pendekatan **key-value store**. Ini jauh lebih fleksibel; kita bisa menambahkan pengaturan baru di masa depan tanpa harus mengubah struktur tabel (tanpa migrasi database).

| Nama Kolom | Tipe Data | Constraint & Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `key` | `TEXT` | **PRIMARY KEY**, **UNIQUE**. Kunci unik untuk setiap pengaturan. | `theme_color` |
| `value` | `TEXT` | **NOT NULL**. Nilai dari pengaturan tersebut, disimpan sebagai teks dan akan di-parsing di level aplikasi. | `blue` |

**Contoh isi tabel `Settings`:**

| key | value |
| :--- | :--- |
| `theme_color` | `blue` |
| `currency_format` | `IDR` |
| `is_pin_enabled` | `true` |
| `user_pin` | `1357` (sebaiknya di-hash) |
| `first_day_of_week`| `monday` |

---

### **Diagram Relasi Entitas (ERD) Sederhana**

Ini menggambarkan bagaimana tabel-tabel tersebut saling berhubungan.

```
+----------------+          +--------------------+
|   Categories   |          |    Transactions    |
+----------------+          +--------------------+
| PK id          |          | PK id              |
|    name        |          |    description     |
|    type        |          |    amount          |
|    created_at  |          |    type            |
+----------------+          |    transaction_date|
       |                    | FK category_id   ○-|-----> (Relasi one-to-many:
       |                    |    created_at      |         Satu Kategori bisa
       '--------------------|    updated_at      |         memiliki banyak Transaksi)
                            +--------------------+

+----------------+
|    Settings    |
+----------------+
| PK key         |
|    value       |
+----------------+
(Tabel ini berdiri sendiri, tidak memiliki relasi langsung)
```

### **Pertimbangan Desain & Aturan**

1.  **Integritas Data:** Penggunaan `FOREIGN KEY` pada `Transactions.category_id` memastikan bahwa setiap transaksi *harus* memiliki kategori yang valid dan ada di tabel `Categories`.
2.  **Aturan Penghapusan Kategori (ON DELETE):** Saat pengguna mencoba menghapus sebuah kategori, kita harus menetapkan sebuah aturan. Pilihan terbaik adalah **`ON DELETE RESTRICT`**. Artinya, database akan **mencegah** penghapusan kategori jika masih ada transaksi yang menggunakannya. Aplikasi kemudian harus memberitahu pengguna, "Anda tidak bisa menghapus kategori ini karena sudah digunakan. Silakan pindahkan transaksinya ke kategori lain terlebih dahulu." Ini adalah pendekatan yang paling aman untuk mencegah kehilangan data.
3.  **Kinerja:** Kolom `transaction_date` pada tabel `Transactions` harus di-**index**. Ini akan secara dramatis mempercepat query saat pengguna memfilter data berdasarkan rentang tanggal (harian, bulanan, tahunan), yang merupakan operasi paling umum di aplikasi ini.
4.  **Konsistensi Tipe:** Kolom `type` ada di kedua tabel (`Categories` dan `Transactions`). Ini adalah denormalisasi yang disengaja untuk memudahkan query. Saat membuat transaksi, kita bisa memastikan `Transactions.type` sama dengan `Categories.type` dari kategori yang dipilih.

Skema ini sudah cukup solid dan skalabel untuk membangun semua fitur yang telah kita rencanakan. Langkah selanjutnya adalah menerjemahkan desain ini ke dalam kode menggunakan **Drift**.