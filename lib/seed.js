// Skrip reseed data awal. Menghapus isi data/*.json dan mengisi ulang
// dengan data meja dan menu contoh. Jalankan: npm run seed
const crypto = require('crypto');
const store = require('./store');
const { uniqueSlug } = require('./util');
const { generateQrDataUrl } = require('./qr');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const TABLE_NUMBERS = ['Meja 1', 'Meja 2', 'Meja 3', 'Meja 4', 'Meja 5'];

const MENU_ITEMS = [
  { nama: 'Nasi Goreng Kampung', kategori: 'makanan', harga: 28000, tersedia: true },
  { nama: 'Ayam Bakar Bumbu Rujak', kategori: 'makanan', harga: 35000, tersedia: true },
  { nama: 'Mie Godog Jawa', kategori: 'makanan', harga: 25000, tersedia: true },
  { nama: 'Sate Ayam 10 Tusuk', kategori: 'makanan', harga: 30000, tersedia: true },
  { nama: 'Gado-Gado Sayur', kategori: 'makanan', harga: 22000, tersedia: false },
  { nama: 'Sop Buntut', kategori: 'makanan', harga: 45000, tersedia: true },
  { nama: 'Es Teh Manis', kategori: 'minuman', harga: 8000, tersedia: true },
  { nama: 'Es Jeruk Peras', kategori: 'minuman', harga: 10000, tersedia: true },
  { nama: 'Kopi Susu Gula Aren', kategori: 'minuman', harga: 18000, tersedia: true },
  { nama: 'Wedang Jahe Susu', kategori: 'minuman', harga: 15000, tersedia: true },
  { nama: 'Jus Alpukat', kategori: 'minuman', harga: 17000, tersedia: false },
  { nama: 'Air Mineral', kategori: 'minuman', harga: 5000, tersedia: true },
];

async function seed() {
  const tables = [];
  const slugs = [];
  for (const nomor of TABLE_NUMBERS) {
    const slug = uniqueSlug(nomor, slugs);
    slugs.push(slug);
    const qrDataUrl = await generateQrDataUrl(`${BASE_URL}/order/${slug}`);
    tables.push({
      id: crypto.randomUUID(),
      nomor,
      slug,
      qrDataUrl,
      createdAt: new Date().toISOString(),
    });
  }
  store.writeAll('tables', tables);

  const menu = MENU_ITEMS.map((item) => ({
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date().toISOString(),
  }));
  store.writeAll('menu', menu);

  store.writeAll('orders', []);

  console.log(`Seed selesai: ${tables.length} meja, ${menu.length} item menu, 0 order.`);
  console.log(`QR meja dibuat mengarah ke ${BASE_URL}/order/:slug`);
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Gagal menjalankan seed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
