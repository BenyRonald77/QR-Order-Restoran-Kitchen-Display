(function () {
  'use strict';

  var container = document.getElementById('ticket-container');
  if (!container) {
    return;
  }
  var kategori = container.getAttribute('data-kategori');
  var indicator = document.getElementById('realtime-indicator');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      var hh = String(d.getHours()).padStart(2, '0');
      var mm = String(d.getMinutes()).padStart(2, '0');
      return hh + ':' + mm;
    } catch (e) {
      return '';
    }
  }

  function ensureGrid() {
    var grid = document.getElementById('ticket-grid');
    if (grid) {
      return grid;
    }
    var emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    grid = document.createElement('div');
    grid.className = 'ticket-grid';
    grid.id = 'ticket-grid';
    container.appendChild(grid);
    return grid;
  }

  function showEmptyStateIfNeeded() {
    var grid = document.getElementById('ticket-grid');
    if (grid && grid.children.length === 0) {
      grid.remove();
      var panel = document.createElement('div');
      panel.className = 'state-panel';
      panel.id = 'empty-state';
      panel.innerHTML =
        '<h3>Belum ada order masuk</h3>' +
        '<p>Tiket akan muncul di sini secara realtime begitu pelanggan mengirim pesanan untuk stasiun ini.</p>';
      container.appendChild(panel);
    }
  }

  function itemRowHtml(orderId, item) {
    var actionHtml = '';
    if (item.status === 'baru') {
      actionHtml =
        '<button class="btn btn-primary btn-sm" type="button" data-advance-btn data-order-id="' +
        orderId + '" data-item-id="' + item.id + '">Mulai Proses</button>';
    } else if (item.status === 'diproses') {
      actionHtml =
        '<button class="btn btn-accent btn-sm" type="button" data-advance-btn data-order-id="' +
        orderId + '" data-item-id="' + item.id + '">Tandai Siap</button>';
    }
    return (
      '<div class="ticket__item" data-item-id="' + item.id + '" data-status="' + item.status + '">' +
      '<div><div class="ticket__item-name">' + item.qty + 'x ' + escapeHtml(item.nama) + '</div>' +
      '<span class="status-badge status-badge--' + item.status + '" data-status-badge>' + item.status + '</span></div>' +
      '<div class="ticket__item-actions">' + actionHtml + '</div>' +
      '</div>'
    );
  }

  function addTicket(payload) {
    var grid = ensureGrid();
    var existing = grid.querySelector('[data-order-id="' + payload.orderId + '"]');
    if (existing) {
      // Order sudah ada tiketnya di stasiun ini (kasus jarang), tambahkan itemnya saja.
      var itemsWrap = existing.querySelector('.ticket__items');
      payload.items.forEach(function (item) {
        itemsWrap.insertAdjacentHTML('beforeend', itemRowHtml(payload.orderId, item));
      });
      return;
    }
    var ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.setAttribute('data-order-id', payload.orderId);
    ticket.innerHTML =
      '<div class="ticket__head"><span class="ticket__table">' + escapeHtml(payload.tableNomor) +
      '</span><span class="ticket__time">' + formatTime(payload.createdAt) + '</span></div>' +
      '<div class="ticket__items">' +
      payload.items.map(function (item) { return itemRowHtml(payload.orderId, item); }).join('') +
      '</div>';
    grid.prepend(ticket);
  }

  function updateItem(payload) {
    var row = container.querySelector('[data-item-id="' + payload.item.id + '"]');
    if (!row) {
      return;
    }
    row.setAttribute('data-status', payload.item.status);
    var badge = row.querySelector('[data-status-badge]');
    if (badge) {
      badge.className = 'status-badge status-badge--' + payload.item.status;
      badge.textContent = payload.item.status;
    }
    var actions = row.querySelector('.ticket__item-actions');
    if (actions) {
      if (payload.item.status === 'diproses') {
        actions.innerHTML =
          '<button class="btn btn-accent btn-sm" type="button" data-advance-btn data-order-id="' +
          payload.orderId + '" data-item-id="' + payload.item.id + '">Tandai Siap</button>';
      } else {
        actions.innerHTML = '';
      }
    }
  }

  function removeDelivered(payload) {
    var row = container.querySelector('[data-item-id="' + payload.itemId + '"]');
    if (!row) {
      return;
    }
    var ticket = row.closest('.ticket');
    row.remove();
    if (ticket && ticket.querySelectorAll('.ticket__item').length === 0) {
      ticket.remove();
    }
    showEmptyStateIfNeeded();
  }

  // Isi ulang jam tiket yang sudah dirender server (dihitung di client
  // agar mengikuti zona waktu perangkat dapur).
  container.querySelectorAll('.ticket__time[data-time]').forEach(function (el) {
    el.textContent = formatTime(el.getAttribute('data-time'));
  });

  container.addEventListener('click', function (evt) {
    var btn = evt.target.closest('[data-advance-btn]');
    if (!btn) {
      return;
    }
    var orderId = btn.getAttribute('data-order-id');
    var itemId = btn.getAttribute('data-item-id');
    btn.disabled = true;
    var originalLabel = btn.textContent;
    btn.textContent = 'Menyimpan…';

    fetch('/dapur/' + encodeURIComponent(kategori) + '/items/' + orderId + '/' + itemId + '/maju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error(result.data && result.data.error ? result.data.error : 'Gagal memperbarui status');
        }
        // Pembaruan tampilan tombol ini dilakukan lewat event socket 'item:update'
        // yang juga diterima oleh layar dapur lain; tidak perlu ubah manual di sini.
      })
      .catch(function (err) {
        window.alert(err.message || 'Gagal memperbarui status. Coba lagi.');
        btn.disabled = false;
        btn.textContent = originalLabel;
      });
  });

  if (typeof io === 'undefined') {
    if (indicator) {
      indicator.textContent = 'Realtime tidak tersedia, muat ulang halaman secara berkala';
      indicator.className = 'status-badge status-badge--baru';
    }
    return;
  }

  var socket = io();

  socket.on('connect', function () {
    if (indicator) {
      indicator.textContent = 'Realtime aktif';
      indicator.className = 'status-badge status-badge--siap';
    }
    socket.emit('join', 'kitchen:' + kategori);
    socket.emit('join', 'admin');
  });

  socket.on('disconnect', function () {
    if (indicator) {
      indicator.textContent = 'Koneksi terputus, mencoba menyambung lagi…';
      indicator.className = 'status-badge status-badge--baru';
    }
  });

  socket.on('order:new', function (payload) {
    addTicket(payload);
  });

  socket.on('item:update', function (payload) {
    updateItem(payload);
  });

  socket.on('item:delivered', function (payload) {
    removeDelivered(payload);
  });
})();
