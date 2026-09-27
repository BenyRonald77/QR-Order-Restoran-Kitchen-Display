const express = require('express');
const store = require('../lib/store');
const { uniqueSlug, deriveOrderStatus } = require('../lib/util');
const { generateQrDataUrl } = require('../lib/qr');

const router = express.Router();

function baseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function withDerivedStatus(order) {
  return { ...order, status: deriveOrderStatus(order.items) };
}

// ---------- Dashboard ----------
router.get('/', (req, res, next) => {
  try {
    const orders = store.readAll('orders').map(withDerivedStatus);
    const activeOrders = orders
      .filter((o) => o.status !== 'diantar')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const tableCount = store.readAll('tables').length;
    const menuCount = store.readAll('menu').length;
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      activeOrders,
      tableCount,
      menuCount,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Meja ----------
router.get('/tables', async (req, res, next) => {
  try {
    const tables = store.readAll('tables').sort((a, b) => a.nomor.localeCompare(b.nomor));
    res.render('admin/tables', {
      title: 'Kelola Meja',
      tables,
      baseUrl: baseUrl(req),
      error: req.query.error || null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/tables', async (req, res, next) => {
  try {
    const nomor = String(req.body.nomor || '').trim();
    if (!nomor) {
      return res.redirect('/admin/tables?error=Nomor+meja+wajib+diisi');
    }
    const existingSlugs = store.readAll('tables').map((t) => t.slug);
    const slug = uniqueSlug(nomor, existingSlugs);
    const qrDataUrl = await generateQrDataUrl(`${baseUrl(req)}/order/${slug}`);
    store.insert('tables', {
      nomor,
      slug,
      qrDataUrl,
      createdAt: new Date().toISOString(),
    });
    res.redirect('/admin/tables');
  } catch (err) {
    next(err);
  }
});

router.post('/tables/:id/update', async (req, res, next) => {
  try {
    const nomor = String(req.body.nomor || '').trim();
    if (!nomor) {
      return res.redirect('/admin/tables?error=Nomor+meja+wajib+diisi');
    }
    store.update('tables', req.params.id, { nomor });
    res.redirect('/admin/tables');
  } catch (err) {
    next(err);
  }
});

router.post('/tables/:id/delete', (req, res, next) => {
  try {
    store.remove('tables', req.params.id);
    res.redirect('/admin/tables');
  } catch (err) {
    next(err);
  }
});

// ---------- Menu ----------
router.get('/menu', (req, res, next) => {
  try {
    const menu = store.readAll('menu').sort((a, b) => a.nama.localeCompare(b.nama));
    res.render('admin/menu', { title: 'Kelola Menu', menu, error: req.query.error || null });
  } catch (err) {
    next(err);
  }
});

router.post('/menu', (req, res, next) => {
  try {
    const nama = String(req.body.nama || '').trim();
    const kategori = req.body.kategori === 'minuman' ? 'minuman' : 'makanan';
    const harga = Math.max(0, Number(req.body.harga) || 0);
    if (!nama) {
      return res.redirect('/admin/menu?error=Nama+menu+wajib+diisi');
    }
    store.insert('menu', {
      nama,
      kategori,
      harga,
      tersedia: true,
      createdAt: new Date().toISOString(),
    });
    res.redirect('/admin/menu');
  } catch (err) {
    next(err);
  }
});

router.post('/menu/:id/update', (req, res, next) => {
  try {
    const nama = String(req.body.nama || '').trim();
    const kategori = req.body.kategori === 'minuman' ? 'minuman' : 'makanan';
    const harga = Math.max(0, Number(req.body.harga) || 0);
    if (!nama) {
      return res.redirect('/admin/menu?error=Nama+menu+wajib+diisi');
    }
    store.update('menu', req.params.id, { nama, kategori, harga });
    res.redirect('/admin/menu');
  } catch (err) {
    next(err);
  }
});

router.post('/menu/:id/toggle', (req, res, next) => {
  try {
    const item = store.findById('menu', req.params.id);
    if (item) {
      store.update('menu', req.params.id, { tersedia: !item.tersedia });
    }
    res.redirect('/admin/menu');
  } catch (err) {
    next(err);
  }
});

router.post('/menu/:id/delete', (req, res, next) => {
  try {
    store.remove('menu', req.params.id);
    res.redirect('/admin/menu');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
