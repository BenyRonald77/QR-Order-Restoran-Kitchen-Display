// Menyusun data order menjadi "tiket dapur" per stasiun: satu tiket
// mewakili satu order, berisi hanya item yang termasuk stasiun tsb
// dan belum berstatus "diantar".
const store = require('./store');

function activeTicketsForStation(kategori) {
  const orders = store.readAll('orders');
  return orders
    .map((order) => ({
      orderId: order.id,
      tableNomor: order.tableNomor,
      createdAt: order.createdAt,
      items: order.items.filter((it) => it.kategori === kategori && it.status !== 'diantar'),
    }))
    .filter((ticket) => ticket.items.length > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

module.exports = { activeTicketsForStation };
