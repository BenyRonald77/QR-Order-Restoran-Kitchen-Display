const path = require('path');
const express = require('express');

const adminRouter = require('./routes/admin');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman tidak ditemukan',
    message: 'Halaman yang kamu tuju tidak ada. Periksa kembali tautan atau kode QR yang dipakai.',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Terjadi kesalahan',
    message: 'Ada masalah di server saat memproses permintaan ini. Silakan coba lagi.',
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = { app };
