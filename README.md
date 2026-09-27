# QR Order Restoran + Kitchen Display

Sistem pemesanan meja berbasis QR code untuk restoran, dilengkapi kitchen display realtime per stasiun (makanan/minuman) dan halaman status pesanan realtime untuk pelanggan.

Dokumen terkait: [PRD.md](./PRD.md) untuk kebutuhan produk lengkap, [DESIGN.md](./DESIGN.md) untuk arah desain, dan [VERIFICATION.md](./VERIFICATION.md) untuk catatan hasil pengujian manual.

## Cara install dan menjalankan

Butuh Node.js versi 22 ke atas.

```bash
npm install
npm run seed   # isi data awal: 5 meja + QR code, 12 item menu contoh
npm start      # jalankan server
```

Setelah `npm start`, buka:

- `http://localhost:3000/admin` untuk dashboard admin (kelola meja, kelola menu, pantau order aktif)
- `http://localhost:3000/order/meja-1` untuk mencoba halaman pemesanan pelanggan (ganti `meja-1` dengan slug meja lain sesuai data seed)
- `http://localhost:3000/dapur/makanan` dan `http://localhost:3000/dapur/minuman` untuk kitchen display

## Port

Server berjalan di port `3000` secara default. Untuk memakai port lain, set variabel lingkungan `PORT`, misalnya:

```bash
PORT=4000 npm start
```

QR code yang dibuat saat `npm run seed` mengarah ke `BASE_URL` (default `http://localhost:<PORT>`). Jika restoran diakses lewat domain lain (misalnya lewat tunnel atau jaringan lokal), set `BASE_URL` sebelum menjalankan seed atau menambah meja baru dari halaman admin, contoh:

```bash
BASE_URL=http://192.168.1.10:3000 npm run seed
```

QR yang dibuat lewat form "Tambah Meja Baru" di `/admin/tables` otomatis memakai alamat yang sedang diakses saat itu, jadi biasanya tidak perlu mengatur `BASE_URL` secara manual kecuali untuk seed awal.

## Cara reseed data

`npm run seed` akan **mengganti seluruh isi** `data/tables.json`, `data/menu.json`, dan `data/orders.json` (order dikosongkan) dengan data contoh. Jalankan ini kapan saja untuk mengembalikan ke kondisi awal saat demo atau pengujian:

```bash
npm run seed
```

Data disimpan sebagai file JSON biasa di folder `data/`, sehingga juga bisa diedit langsung dengan text editor bila perlu, selama server tidak sedang menulis ke file yang sama di saat bersamaan.

## Alasan pilihan teknis

- **Express + EJS**: render halaman di server agar halaman pelanggan (diakses dari HP hasil scan QR) tetap ringan dan cepat tampil tanpa proses build terpisah.
- **socket.io**: kitchen display dan halaman status pelanggan butuh pembaruan realtime dua arah (server mendorong perubahan ke banyak klien sekaligus per ruangan/stasiun), yang cocok dengan model room pada socket.io.
- **File JSON sebagai penyimpanan (`lib/store.js`)**: sesuai kebutuhan proyek ini agar mudah dijalankan tanpa instalasi database terpisah, cukup untuk skala satu outlet dengan trafik rendah-menengah. Lihat bagian Batasan di PRD.md untuk konsekuensinya.
- **Library `qrcode`**: generate QR code murni di Node.js (tanpa binding native) sehingga instalasi tetap sederhana di berbagai environment.
- **Vanilla JS di sisi client**: keranjang belanja, kitchen display, dan halaman status semuanya interaktif tanpa framework front-end, supaya ukuran halaman tetap kecil dan sesuai kebutuhan sebenarnya (form, tombol, dan pembaruan lewat socket, bukan aplikasi single-page yang kompleks).
