// Fungsi bantu kecil dipakai lintas route: slug meja dan status order turunan.

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'meja';
}

// Membuat slug unik dari nomor meja, menambahkan angka bila sudah ada yang sama.
function uniqueSlug(baseText, existingSlugs) {
  const base = slugify(baseText);
  if (!existingSlugs.includes(base)) {
    return base;
  }
  let n = 2;
  while (existingSlugs.includes(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}

const STATUS_ORDER = ['baru', 'diproses', 'siap', 'diantar'];

// Status keseluruhan order diturunkan dari status semua item di dalamnya:
// status keseluruhan = status paling awal di antara seluruh item.
// Order dianggap "diantar" hanya jika SEMUA item sudah "diantar".
function deriveOrderStatus(items) {
  if (!items || items.length === 0) {
    return 'baru';
  }
  let minIndex = STATUS_ORDER.length - 1;
  for (const item of items) {
    const idx = STATUS_ORDER.indexOf(item.status);
    const safeIdx = idx === -1 ? 0 : idx;
    if (safeIdx < minIndex) {
      minIndex = safeIdx;
    }
  }
  return STATUS_ORDER[minIndex];
}

function formatRupiah(amount) {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

module.exports = {
  slugify,
  uniqueSlug,
  STATUS_ORDER,
  deriveOrderStatus,
  formatRupiah,
};
