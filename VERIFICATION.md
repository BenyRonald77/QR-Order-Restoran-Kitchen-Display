# Catatan Verifikasi Manual

Dilakukan sebelum push terakhir, sesuai R-35 (antislop). Server dijalankan lokal (`node server.js`), diuji lewat `curl` untuk seluruh alur data, dan lewat instrumentasi log sementara di `server.js` untuk memastikan event socket.io benar-benar dipanggil (instrumentasi tersebut sudah dihapus dari kode final, tidak ada sisa kode debug yang ter-commit).

## 1. Instalasi dan menjalankan server

```
npm install
npm run seed
node server.js
```

Hasil: `npm install` selesai tanpa error (127 package, 0 vulnerability). `npm run seed` mengisi 5 meja + QR code dan 12 item menu, order dikosongkan. Server berjalan dan merespons di `/admin` dengan HTTP 200.

## 2. Cek route utama (HTTP status)

| Route | Hasil |
|---|---|
| `GET /` | 302 (redirect ke `/admin`) |
| `GET /admin` | 200 |
| `GET /admin/tables` | 200 |
| `GET /admin/menu` | 200 |
| `GET /dapur/makanan` | 200 |
| `GET /dapur/minuman` | 200 |
| `GET /socket.io/socket.io.js` | 200 (153.519 bytes, aset client socket.io tersaji dengan benar) |
| `GET /order/meja-tidak-ada` | 404 (halaman "Meja tidak ditemukan") |
| `GET /dapur/lainnya` | 404 (stasiun tidak dikenal) |

## 3. Simulasi alur pesanan penuh lewat curl

Meja uji: `meja-1`. Item uji: 1 item makanan (Nasi Goreng Kampung, qty 2), 1 item minuman (Es Teh Manis, qty 1).

1. **POST `/order/meja-1/api/orders`** dengan kedua item di atas.
   Hasil: `201`, respons `{"id":"<order-id>"}`.
2. **Cek data tersimpan** langsung dari `data/orders.json`: order baru muncul dengan `status: "baru"`, kedua item tersimpan dengan `kategori` masing-masing (`makanan` / `minuman`) dan `status: "baru"`. Sesuai FR-14 dan FR-15 (item otomatis dikelompokkan per stasiun).
3. **Cek pemisahan per stasiun**: item makanan muncul di HTML `/dapur/makanan` (`grep -c` = 1) dan TIDAK muncul di `/dapur/minuman` (`grep -c` = 0). Item minuman sebaliknya. Sesuai FR-17.
4. **Update status via POST `/dapur/makanan/items/:orderId/:itemId/maju`** dipanggil dua kali: `baru -> diproses` lalu `diproses -> siap`. Setiap panggilan mengembalikan item dengan status baru yang benar.
   Panggilan ketiga (mencoba maju dari `siap`) ditolak dengan `400` dan pesan "Item sudah siap, menunggu diantar". Item minuman diuji dengan pola sama di `/dapur/minuman`.
5. **Cek status tersimpan**: `data/orders.json` menunjukkan kedua item sudah `status: "siap"`.
6. **Cek halaman status pelanggan** `/order/meja-1/status/:orderId`: langkah aktif pada linimasa berubah mengikuti status server, diverifikasi tiga kondisi berbeda (baru, diproses, siap) lewat pengecekan class `timeline__step--current` pada HTML yang dirender, dengan label yang sesuai ("Pesanan diterima" / "Sedang diproses" / "Siap disajikan").
7. **Tandai diantar** lewat `POST /admin/orders/:orderId/items/:itemId/antar` untuk kedua item. Respons akhir: `{"ok":true,"status":"diantar"}`.
8. **Cek halaman status akhir**: langkah "Sudah diantar" menjadi `timeline__step--current`.
9. **Cek dashboard admin**: setelah seluruh item diantar, `/admin` kembali menampilkan state kosong "Belum ada order masuk" (order yang sudah selesai tidak lagi dihitung sebagai order aktif).

## 4. Validasi input (jalur error)

| Kasus | Hasil |
|---|---|
| Pesan item yang `tersedia: false` (habis) | `400`, pesan "... sedang habis, hapus dari keranjang" |
| Submit keranjang kosong (`items: []`) | `400`, pesan "Keranjang kosong, tambahkan minimal satu item" |
| Submit ke slug meja yang tidak ada | `404`, pesan "Meja tidak ditemukan" |
| Maju status item dari stasiun yang salah (item minuman lewat endpoint `/dapur/makanan`) | `400`, pesan "Item ini bukan milik stasiun ini" |
| Tandai diantar sebelum status `siap` | `400`, pesan "Item baru bisa diantar setelah berstatus siap" |

## 5. Verifikasi event socket.io benar-benar dipanggil

Karena pembaruan realtime tidak bisa dibuktikan lewat curl saja, ditambahkan instrumentasi sementara di `server.js` yang mencatat setiap `io.to(room).emit(event, payload)` ke log server, dijalankan ulang lewat skenario yang sama di atas. Hasil yang tercatat di log (ringkas, room dan nama event, payload lengkap tersedia di histori pengujian):

- Saat order baru dibuat (`POST /order/:slug/api/orders`): `emit "order:new"` terkirim ke room `kitchen:makanan`, `kitchen:minuman` (sesuai kategori item), dan `admin`.
- Saat item dimajukan lewat kitchen display (`POST /dapur/:kategori/items/.../maju`): `emit "item:update"` ke room `kitchen:<kategori>`, `emit "order:update"` ke room `order:<orderId>` dan `admin`.
- Saat item ditandai diantar dari admin (`POST /admin/orders/.../antar`): `emit "order:update"` ke `order:<orderId>` dan `admin`, serta `emit "item:delivered"` ke `kitchen:<kategori>` (agar tiket hilang dari layar dapur begitu diantar).

Seluruh emit di atas terkonfirmasi terpanggil pada setiap transisi status yang diuji di bagian 3, dengan payload yang berisi data item/order yang benar (dicocokkan manual terhadap isi `data/orders.json` pada saat yang sama). Instrumentasi log ini bersifat sementara untuk keperluan pengujian dan sudah dihapus dari kode yang di-commit; `server.js` final tidak mengandung kode debug tambahan.

## 6. Ringkasan

Seluruh rute utama, alur pemesanan, pemisahan stasiun dapur, transisi status, notifikasi realtime (dibuktikan lewat log emit), dan jalur validasi/error sudah diuji dan berjalan sesuai PRD. Server dimatikan setelah pengujian selesai.
