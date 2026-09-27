const express = require('express');
const crypto = require('crypto');
const store = require('../lib/store');

const router = express.Router();

function findTableBySlug(slug) {
  return store.findOne('tables', (t) => t.slug === slug);
}

function groupMenu(menu) {
  return {
    makanan: menu.filter((m) => m.kategori === 'makanan'),
    minuman: menu.filter((m) => m.kategori === 'minuman'),
  };
}

// Halaman pemesanan pelanggan
router.get('/:slug', (req, res, next) => {
  try {
    const table = findTableBySlug(req.params.slug);
    if (!table) {
      return res.status(404).render('order/not-found', {
        title: 'Meja tidak ditemukan',
      });
    }
    const menu = store.readAll('menu');
    res.render('order/menu', {
      title: `Pesan - ${table.nomor}`,
      table,
      menuByCategory: groupMenu(menu),
    });
  } catch (err) {
    next(err);
  }
});

// Submit order baru dari pelanggan
router.post('/:slug/api/orders', (req, res, next) => {
  try {
    const table = findTableBySlug(req.params.slug);
    if (!table) {
      return res.status(404).json({ error: 'Meja tidak ditemukan' });
    }
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (rawItems.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong, tambahkan minimal satu item' });
    }

    const menu = store.readAll('menu');
    const orderItems = [];
    for (const raw of rawItems) {
      const menuItem = menu.find((m) => m.id === raw.menuItemId);
      const qty = Math.floor(Number(raw.qty));
      if (!menuItem) {
        return res.status(400).json({ error: 'Salah satu item menu tidak valid, muat ulang halaman' });
      }
      if (!menuItem.tersedia) {
        return res.status(400).json({ error: `${menuItem.nama} sedang habis, hapus dari keranjang` });
      }
      if (!Number.isFinite(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({ error: `Jumlah untuk ${menuItem.nama} tidak valid` });
      }
      orderItems.push({
        id: crypto.randomUUID(),
        menuItemId: menuItem.id,
        nama: menuItem.nama,
        kategori: menuItem.kategori,
        harga: menuItem.harga,
        qty,
        status: 'baru',
      });
    }

    const now = new Date().toISOString();
    const order = store.insert('orders', {
      tableId: table.id,
      tableNomor: table.nomor,
      items: orderItems,
      status: 'baru',
      createdAt: now,
      updatedAt: now,
    });

    // Item sudah dikelompokkan per kategori/stasiun di dalam order.items,
    // siap dipakai kitchen display begitu fitur itu dibangun.
    const io = req.app.get('io');
    io.to('admin').emit('order:new', {
      orderId: order.id,
      tableNomor: order.tableNomor,
      createdAt: order.createdAt,
      status: order.status,
      items: orderItems,
    });

    res.status(201).json({ id: order.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
