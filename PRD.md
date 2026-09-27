# PRD: QR Order Restoran + Kitchen Display

## 1. Ringkasan Produk

Sistem pemesanan berbasis QR code untuk restoran kasual. Setiap meja mendapat QR code unik yang mengarah ke halaman pemesanan tanpa login. Pelanggan memesan langsung dari HP mereka, pesanan masuk otomatis ke layar dapur (kitchen display) sesuai stasiun (makanan/minuman) secara realtime, dan pelanggan bisa memantau status pesanannya tanpa perlu bertanya ke staf. Admin/kasir mengelola data meja, menu, dan memantau seluruh order aktif dari satu dashboard.

## 2. Latar Belakang dan Masalah

Pada alur manual, pelanggan menunggu pelayan untuk mencatat pesanan, pesanan dicatat di kertas lalu dibawa ke dapur, dan pelanggan tidak tahu progres pesanannya kecuali bertanya langsung. Ini menimbulkan antrian pelayan, salah catat, dan pelanggan yang berulang kali bertanya "pesanan saya sudah sampai mana". Sistem ini memindahkan pencatatan pesanan ke pelanggan sendiri (self-order via QR), memisahkan tampilan dapur per stasiun agar staf hanya melihat item yang relevan dengan pekerjaannya, dan memberi status realtime ke pelanggan tanpa perlu refresh manual.

## 3. Tujuan

- Pelanggan dapat memesan sendiri dari meja tanpa menunggu pelayan mencatat.
- Staf dapur menerima order baru secara realtime, terpisah per stasiun (makanan/minuman), agar tidak perlu menyaring item yang bukan tanggung jawabnya.
- Pelanggan dapat memantau status pesanannya sendiri secara realtime tanpa refresh halaman.
- Admin/kasir dapat mengelola data meja, menu, dan memantau seluruh order aktif dari satu tempat.

## 4. Peran Pengguna

| Peran | Login | Deskripsi |
|---|---|---|
| Pelanggan | Tidak perlu login | Mengakses `/order/:slug` lewat scan QR di meja, memilih menu, submit pesanan, memantau status |
| Staf Dapur (per stasiun) | Tidak perlu login (perangkat bersama di dapur) | Mengakses `/dapur/makanan` atau `/dapur/minuman`, melihat tiket order masuk khusus stasiunnya, mengubah status item |
| Admin/Kasir | Tidak perlu login pada versi ini (perangkat terbatas hanya di area kasir) | Mengakses `/admin`, mengelola meja dan menu, memantau seluruh order aktif semua meja |

Catatan asumsi: versi ini belum mengimplementasikan autentikasi staf/admin (lihat bagian Batasan). Pemisahan akses saat ini murni berdasarkan URL yang tidak dipublikasikan ke pelanggan, bukan mekanisme keamanan penuh.

## 5. Ruang Lingkup

Termasuk dalam ruang lingkup:
- CRUD data meja (nomor meja, slug unik, QR code otomatis).
- CRUD data menu (nama, kategori/stasiun, harga, status tersedia/habis).
- Halaman pemesanan pelanggan per meja dengan keranjang sisi klien.
- Kitchen display realtime per stasiun dengan update status item.
- Halaman status pesanan realtime untuk pelanggan.
- Dashboard admin berisi daftar order aktif semua meja.

Di luar ruang lingkup versi ini:
- Pembayaran online/payment gateway.
- Autentikasi/login staf dan admin dengan password.
- Manajemen stok bahan baku (hanya toggle tersedia/habis per item menu).
- Aplikasi mobile native (semua akses lewat browser HP/tablet).

## 6. User Stories

### Pelanggan
- Sebagai pelanggan, saya ingin memindai QR di meja saya agar langsung melihat menu restoran tanpa install aplikasi.
- Sebagai pelanggan, saya ingin menambah beberapa item ke keranjang sebelum mengirim pesanan, agar saya bisa memesan sekali jalan untuk seluruh meja.
- Sebagai pelanggan, saya ingin tahu status pesanan saya (baru/diproses/siap/diantar) tanpa harus bertanya ke staf atau refresh halaman berulang kali.
- Sebagai pelanggan, saya ingin tahu jika sebuah menu sedang habis sebelum saya memesannya.

### Staf Dapur
- Sebagai staf stasiun makanan, saya hanya ingin melihat item makanan yang perlu saya siapkan, bukan item minuman.
- Sebagai staf dapur, saya ingin order baru langsung muncul di layar begitu pelanggan submit, tanpa perlu refresh manual.
- Sebagai staf dapur, saya ingin mengubah status item (baru -> diproses -> siap) dengan satu tombol agar prosesnya cepat saat tangan sibuk.

### Admin/Kasir
- Sebagai admin, saya ingin menambah meja baru dan langsung mendapat QR code yang siap dicetak dan ditempel di meja.
- Sebagai admin, saya ingin menonaktifkan menu yang sedang habis agar tidak bisa dipesan pelanggan.
- Sebagai kasir, saya ingin melihat seluruh order aktif dari semua meja dalam satu layar untuk memantau operasional.

## 7. Functional Requirements

### 7.1 Manajemen Meja
- FR-1: Sistem menyediakan halaman admin untuk menambah, mengubah, dan menghapus data meja.
- FR-2: Setiap meja memiliki nomor meja dan slug unik yang menjadi bagian dari URL `/order/:slug`.
- FR-3: Sistem menghasilkan slug unik otomatis saat meja baru dibuat (berbasis nomor meja, dengan penanganan bila terjadi duplikasi).
- FR-4: Sistem men-generate QR code (gambar) yang meng-encode URL lengkap `/order/:slug` untuk setiap meja.
- FR-5: Halaman admin menampilkan QR code tiap meja dalam format yang bisa dicetak (ukuran memadai, ada label nomor meja).

### 7.2 Manajemen Menu
- FR-6: Sistem menyediakan halaman admin untuk menambah, mengubah, dan menghapus item menu.
- FR-7: Setiap item menu memiliki nama, kategori/stasiun (makanan atau minuman), harga, dan status tersedia (true/false).
- FR-8: Admin dapat mengubah status tersedia/habis sebuah item menu dengan satu aksi (toggle).
- FR-9: Item menu berstatus habis tidak muncul sebagai pilihan yang bisa ditambahkan di halaman pemesanan pelanggan (ditampilkan tapi non-aktif, bukan disembunyikan diam-diam, agar pelanggan tahu menu itu ada tapi sedang habis).

### 7.3 Alur Pemesanan Pelanggan
- FR-10: Halaman `/order/:slug` dapat diakses tanpa login dan menampilkan nama/nomor meja yang sesuai dengan slug tersebut.
- FR-11: Menu ditampilkan dikelompokkan per kategori (makanan, minuman), hanya menampilkan item yang statusnya tersedia sebagai bisa ditambahkan.
- FR-12: Pelanggan dapat menambah/mengurangi jumlah item ke keranjang di sisi client (state disimpan di browser, belum dikirim ke server) sebelum submit.
- FR-13: Pelanggan dapat mengubah isi keranjang (ubah jumlah, hapus item) sebelum submit.
- FR-14: Saat submit, sistem menyimpan order baru berstatus "baru" beserta seluruh item, jumlah, dan catatan meja asal.
- FR-15: Setiap item dalam order otomatis dikelompokkan berdasarkan stasiun menunya (makanan/minuman) agar bisa disaring oleh masing-masing kitchen display.
- FR-16: Setelah submit berhasil, pelanggan diarahkan ke halaman status pesanan miliknya.

### 7.4 Kitchen Display Realtime
- FR-17: Halaman `/dapur/makanan` menampilkan hanya item order dengan stasiun makanan; `/dapur/minuman` menampilkan hanya item dengan stasiun minuman.
- FR-18: Saat pelanggan submit order baru, item yang relevan muncul di kitchen display terkait secara realtime melalui socket.io, tanpa refresh halaman.
- FR-19: Setiap item pada kitchen display menampilkan nama menu, jumlah, nomor meja, dan status saat ini (baru/diproses/siap).
- FR-20: Staf dapur dapat mengubah status sebuah item lewat tombol aksi (baru -> diproses, diproses -> siap).
- FR-21: Perubahan status sebuah item di-broadcast realtime ke kitchen display terkait dan ke halaman status pelanggan yang memesan item tersebut.

### 7.5 Status Pesanan untuk Pelanggan
- FR-22: Sistem menyediakan halaman status pesanan yang menampilkan seluruh item beserta status masing-masing, dan status keseluruhan order.
- FR-23: Halaman status memperbarui tampilan secara realtime lewat socket.io ketika status item/order berubah, tanpa pelanggan perlu refresh.
- FR-24: Status order mengikuti urutan: baru -> diproses -> siap -> diantar. Order dianggap selesai setelah status "diantar" tercapai untuk seluruh item.

### 7.6 Dashboard Admin
- FR-25: Halaman `/admin` menampilkan daftar seluruh order yang masih aktif (belum berstatus "diantar" penuh) dari semua meja, termasuk nomor meja dan status tiap item.
- FR-26: Admin dapat melihat riwayat order per meja dari dashboard yang sama.

### 7.7 Umum
- FR-27: Setiap halaman yang menampilkan data (order, menu, meja) memiliki state kosong, loading, dan error yang jelas dan actionable.
- FR-28: Navigasi antar halaman (admin, dapur, pelanggan) hanya berisi tautan ke halaman yang benar-benar ada.

## 8. Data Model

### Table (meja)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| nomor | string | Nomor/nama meja, misal "Meja 4" |
| slug | string | Unik, dipakai di URL `/order/:slug` |
| qrDataUrl | string | Data URL PNG QR code hasil generate |
| createdAt | string (ISO date) | Waktu dibuat |

### MenuItem
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| nama | string | Nama item menu |
| kategori | string | `makanan` atau `minuman`, juga dipakai sebagai kunci stasiun dapur |
| harga | number | Harga dalam Rupiah |
| tersedia | boolean | Status stok, true = bisa dipesan |
| createdAt | string (ISO date) | Waktu dibuat |

### Order
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| tableId | string | Relasi ke Table.id |
| tableNomor | string | Salinan nomor meja saat order dibuat (agar tampilan tidak bergantung lookup ulang) |
| items | OrderItem[] | Daftar item pesanan (lihat di bawah) |
| status | string | Status keseluruhan order, turunan dari status item: `baru`, `diproses`, `siap`, `diantar` |
| createdAt | string (ISO date) | Waktu order dibuat |
| updatedAt | string (ISO date) | Waktu terakhir ada perubahan status |

### OrderItem (embedded di dalam Order.items)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Id unik item dalam order |
| menuItemId | string | Relasi ke MenuItem.id |
| nama | string | Salinan nama menu saat dipesan |
| kategori | string | Salinan kategori/stasiun saat dipesan |
| harga | number | Salinan harga saat dipesan |
| qty | number | Jumlah dipesan |
| status | string | `baru`, `diproses`, `siap`, `diantar` |

## 9. Non-Functional Requirements

- **Realtime**: pembaruan order baru dan perubahan status harus tersampaikan ke kitchen display dan halaman status pelanggan melalui socket.io tanpa memerlukan refresh manual dari pengguna.
- **Aksesibilitas**: seluruh elemen interaktif dapat dioperasikan dengan keyboard, memiliki focus state yang terlihat jelas, dan kontras warna teks memenuhi WCAG AA.
- **Mobile-first**: halaman pelanggan wajib nyaman dipakai di layar HP karena diakses langsung dari hasil scan QR di meja, target sentuh minimal 44px, tanpa horizontal scroll.
- **Keamanan dasar**: input dari pelanggan (jumlah item, pilihan menu) divalidasi di server sebelum disimpan; ID entitas memakai UUID acak agar tidak mudah ditebak; halaman dapur dan admin tidak ditautkan dari halaman publik pelanggan.
- **Ketahanan data**: penyimpanan berbasis file JSON harus tetap konsisten walau ada beberapa penulisan berurutan dalam waktu singkat (akses file dilakukan secara sinkron per operasi tulis).

## 10. Batasan dan Asumsi

- Belum ada autentikasi login untuk staf dapur maupun admin pada versi ini. Pemisahan akses saat ini berbasis pemisahan URL, dengan asumsi perangkat dapur dan kasir adalah perangkat khusus yang tidak diakses publik. Ini dicatat sebagai keterbatasan, bukan klaim keamanan penuh.
- Penyimpanan data memakai file JSON lokal (bukan database server), sesuai kebutuhan proyek ini agar mudah dijalankan tanpa instalasi database terpisah. Ini cukup untuk skala satu outlet dengan trafik rendah-menengah, dan bukan solusi yang dirancang untuk banyak proses/server berjalan bersamaan.
- Pembayaran tidak termasuk dalam sistem ini; transaksi pembayaran diasumsikan tetap ditangani manual oleh kasir di luar sistem.
- Tidak ada manajemen stok bahan baku granular, hanya status tersedia/habis per item menu yang diubah manual oleh admin.
