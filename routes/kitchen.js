const express = require('express');
const store = require('../lib/store');
const { activeTicketsForStation } = require('../lib/tickets');
const { STATUS_ORDER, deriveOrderStatus } = require('../lib/util');

const router = express.Router();

const STATIONS = ['makanan', 'minuman'];
const STATION_LABEL = { makanan: 'Makanan', minuman: 'Minuman' };

router.get('/:kategori', (req, res, next) => {
  try {
    const kategori = req.params.kategori;
    if (!STATIONS.includes(kategori)) {
      return next();
    }
    const tickets = activeTicketsForStation(kategori);
    res.render('kitchen/display', {
      title: `Dapur ${STATION_LABEL[kategori]}`,
      kategori,
      kategoriLabel: STATION_LABEL[kategori],
      tickets,
    });
  } catch (err) {
    next(err);
  }
});

// Memajukan status satu item: baru -> diproses -> siap.
// Kitchen display tidak berwenang menandai "diantar" (itu tugas kasir/pengantar).
router.post('/:kategori/items/:orderId/:itemId/maju', (req, res, next) => {
  try {
    const kategori = req.params.kategori;
    if (!STATIONS.includes(kategori)) {
      return res.status(404).json({ error: 'Stasiun tidak dikenal' });
    }
    const order = store.findById('orders', req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }
    const item = order.items.find((i) => i.id === req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item tidak ditemukan' });
    }
    if (item.kategori !== kategori) {
      return res.status(400).json({ error: 'Item ini bukan milik stasiun ini' });
    }
    const currentIdx = STATUS_ORDER.indexOf(item.status);
    const siapIdx = STATUS_ORDER.indexOf('siap');
    if (currentIdx >= siapIdx) {
      return res.status(400).json({ error: 'Item sudah siap, menunggu diantar' });
    }
    item.status = STATUS_ORDER[currentIdx + 1];
    order.updatedAt = new Date().toISOString();
    const saved = store.replace('orders', order.id, order);
    const overallStatus = deriveOrderStatus(saved.items);

    const io = req.app.get('io');
    io.to(`kitchen:${kategori}`).emit('item:update', {
      orderId: saved.id,
      item,
    });
    io.to(`order:${saved.id}`).emit('order:update', {
      orderId: saved.id,
      status: overallStatus,
      items: saved.items,
    });
    io.to('admin').emit('order:update', {
      orderId: saved.id,
      status: overallStatus,
      items: saved.items,
      tableNomor: saved.tableNomor,
    });

    res.json({ ok: true, item, status: overallStatus });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
