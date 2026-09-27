(function () {
  'use strict';

  var STEP_ORDER = ['baru', 'diproses', 'siap', 'diantar'];
  var timeline = document.getElementById('timeline');
  var connectionNote = document.getElementById('connection-note');
  if (!timeline) {
    return;
  }
  var orderId = timeline.getAttribute('data-order-id');

  function applyStatus(status) {
    var currentIdx = STEP_ORDER.indexOf(status);
    var steps = timeline.querySelectorAll('[data-step]');
    steps.forEach(function (stepEl) {
      var key = stepEl.getAttribute('data-step');
      var idx = STEP_ORDER.indexOf(key);
      stepEl.classList.remove('timeline__step--done', 'timeline__step--current');
      if (idx < currentIdx) {
        stepEl.classList.add('timeline__step--done');
      } else if (idx === currentIdx) {
        stepEl.classList.add('timeline__step--current');
      }
    });
  }

  function applyItems(items) {
    (items || []).forEach(function (item) {
      var row = document.querySelector('[data-item-id="' + item.id + '"]');
      if (!row) {
        return;
      }
      var badge = row.querySelector('[data-item-status]');
      if (badge && badge.textContent.trim() !== item.status) {
        badge.className = 'status-badge status-badge--' + item.status;
        badge.textContent = item.status;
        row.classList.remove('flash-once');
        // eslint-disable-next-line no-unused-expressions
        void row.offsetWidth; // memicu ulang animasi
        row.classList.add('flash-once');
      }
    });
  }

  if (typeof io === 'undefined') {
    connectionNote.textContent = 'Pembaruan realtime tidak tersedia, muat ulang halaman untuk melihat status terbaru.';
    return;
  }

  var socket = io();

  socket.on('connect', function () {
    connectionNote.textContent = 'Terhubung. Halaman ini akan otomatis memperbarui status.';
    socket.emit('join', 'order:' + orderId);
  });

  socket.on('disconnect', function () {
    connectionNote.textContent = 'Koneksi realtime terputus, mencoba menyambung lagi…';
  });

  socket.io.on('reconnect_error', function () {
    connectionNote.textContent = 'Gagal menyambung ulang. Muat ulang halaman untuk memastikan status terbaru.';
  });

  socket.on('order:update', function (payload) {
    if (payload.orderId !== orderId) {
      return;
    }
    applyStatus(payload.status);
    applyItems(payload.items);
  });
})();
