# Arahan Desain

Catatan jujur di awal: dokumen ini dibuat oleh agent yang mengerjakan proyek ini, bukan oleh pemilik brand restoran. Belum ada brand guideline asli untuk restoran ini, jadi agent mengambil keputusan desain sendiri sesuai opsi 2 pada wizard R-37 (antislop). Artinya arah desain ini masuk akal dan sudah disaring dari pola AI generik, tapi tetap draf yang layak digantikan oleh pemilik produk begitu ada identitas brand nyata (nama restoran, logo, palet resmi).

## Identitas dan kepribadian brand

Produk ini adalah sistem pemesanan meja untuk restoran kasual, dipakai tiga jenis orang berbeda dalam satu sesi kerja: pelanggan yang santai memilih menu dari HP di meja, staf dapur yang bekerja cepat di layar besar dengan tangan penuh, dan kasir/admin yang mengelola operasional. Kepribadian yang dipilih: **hangat, kenyang selera, dan tegas ketika perlu**. Bukan aplikasi "teknologi canggih", tapi alat bantu dapur restoran sehari-hari. Nuansa dekat dengan meja kayu, kertas nota, dan warna makanan panggang, bukan dashboard SaaS.

## Palet warna

| Peran | Warna | Kode | Alasan |
|---|---|---|---|
| Latar utama | Krem kertas | `#FBF3E7` | Netral hangat, mengingatkan kertas menu/nota, bukan putih steril khas dashboard AI |
| Teks utama & elemen gelap | Cokelat arang | `#2B211B` | Kontras tinggi di atas krem (rasio jauh di atas 4.5:1), terasa seperti kayu bakar/panggangan, bukan hitam pekat generik |
| Warna inti (primer) | Terakota | `#C1522A` | Warna saus/cabai/panggangan, asosiasi langsung dengan makanan, dipakai untuk tombol utama dan status "baru" |
| Aksen | Kunyit/mustard | `#E8A93A` | Satu aksen tunggal untuk penanda status "siap" dan sorotan penting di kitchen display, kontras terhadap terakota agar staf dapur cepat membedakan status dari jarak layar |

Warna netral tambahan (bukan bagian dari palet inti, hanya struktur): abu gelap kehijauan `#5C6259` untuk teks sekunder, dan garis pemisah `#E4D5BE`. Total tetap dalam batas 2-3 inti + 1 aksen sesuai R-29.

## Tipografi

- **Judul & nama menu**: `Fraunces` (serif hangat dengan karakter, dipakai banyak brand kuliner untuk kesan "ditulis tangan editorial") diambil dari Google Fonts. Alasan: memberi rasa "menu restoran" pada nama hidangan, bukan tipografi dashboard.
- **Teks isi, tombol, angka**: `Libre Franklin` (sans humanis, tebal tegas) untuk keterbacaan di layar dapur dari jarak agak jauh dan di HP kecil. Alasan: sans grotesk yang kokoh, bukan pilihan default model AI (Inter/Geist), tetap sangat terbaca di ukuran kecil.
- **Kode meja & nomor order**: `ui-monospace` sistem (tanpa memuat font tambahan), dipakai HANYA pada kode singkat seperti nomor order/kode meja, meniru nota kasir/tiket dapur. Ini penggunaan fungsional (motif identitas), bukan gaya "monospace besar ala AI" yang dilarang R-06.

## Motif identitas

**Motif nota dapur (kitchen ticket)**: garis putus-putus horizontal (dashed) sebagai pemisah antar item pada tiket dapur dan struk ringkasan pesanan, meniru sobekan kertas nota restoran. Dipakai konsisten di kartu order (kitchen display), ringkasan keranjang pelanggan, dan riwayat status. Ini elemen berulang yang membuat produk "milik restoran ini", bukan template generik.

## Tiga dial (ENERGY / RHYTHM / MOTION)

- **ENERGY: 2 (seimbang).** Bukan tenang datar ala situs pemerintah, bukan juga heboh ala portofolio agency. Halaman pelanggan terasa mengundang selera tanpa riuh; halaman dapur mendapat penekanan warna status yang jelas justru lewat kontras warna (terakota vs mustard), bukan lewat menaikkan energi keseluruhan.
- **RHYTHM: 2 (konsisten dengan beberapa variasi).** Tiga jenis halaman (pesan, dapur, status) memakai sistem visual yang sama tapi komposisi berbeda sesuai fungsi: grid kartu menu untuk pelanggan, kolom tiket untuk dapur, satu fokus linimasa status untuk pelanggan yang menunggu. Bukan template seragam, tapi juga bukan asimetris acak.
- **MOTION: 2 (transisi bermakna, bukan loop).** Tiket baru muncul dengan transisi masuk singkat agar staf dapur sadar ada order baru tanpa harus memindai terus-menerus; perubahan status memberi highlight satu kali saat berubah, tidak berkedip terus. Tidak ada animasi hias yang berjalan tanpa henti.

## Keputusan tema

Produk ini sengaja memakai satu tema terang tetap (krem/terakota), tanpa toggle gelap/terang. Alasan: identitas hangat "kertas menu/nota" di atas adalah bagian dari kepribadian brand, dan seluruh pemakaian berlangsung siang/sore di dalam restoran dengan pencahayaan ruangan, bukan pemakaian malam hari yang butuh mode gelap untuk kenyamanan mata. Ini keputusan brand, bukan keterbatasan teknis.

## Prinsip aksesibilitas dan mobile

Semua kombinasi teks di atas divalidasi kontras terhadap latar krem/terakota/arang agar memenuhi WCAG AA. Target sentuh minimum 44px di semua tombol karena halaman pelanggan diakses dari HP di meja. Tidak ada horizontal scroll di lebar layar HP standar.
