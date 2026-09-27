const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const adminRouter = require('./routes/admin');
const orderRouter = require('./routes/order');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// io dipasang di app supaya route bisa emit event lewat req.app.get('io')
app.set('io', io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.use('/admin', adminRouter);
app.use('/order', orderRouter);

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

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    if (typeof room === 'string' && room.length < 100) {
      socket.join(room);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = { app, server, io };
