(function () {
  'use strict';

  var orderList = document.getElementById('order-list');
  var indicator = document.getElementById('realtime-indicator');
  var statCount = document.querySelector('.stat-card__value');
  if (!orderList || typeof io === 'undefined') {
    if (indicator) {
      indicator.textContent = 'Realtime tidak tersedia, muat ulang halaman secara berkala';
    }
    return;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function ensureGrid() {
    var grid = document.getElementById('order-grid');
    if (grid) {
      return grid;
    }
    var emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    grid = document.createElement('div');
    grid.className = 'ticket-grid';
    grid.id = 'order-grid';
    orderList.appendChild(grid);
    return grid;
  }

  function updateActiveCount(delta) {
    if (!statCount) {
      return;
    }
    var val = Number(statCount.textContent) || 0;
    statCount.textContent = String(Math.max(0, val + delta));
  }

  function itemRowHtml(item) {
    return (
      '<div class="ticket__item" data-item-id="' + item.id + '">' +
      '<div><div class="ticket__item-name">' + item.qty + 'x ' + escapeHtml(item.nama) + '</div>' +
      '<div class="ticket__item-qty">' + item.kategori + ' &middot; ' +
      '<span class="status-badge status-badge--' + item.status + '" data-item-status>' + item.status + '</span></div></div>' +
      '<div class="ticket__item-actions"></div>' +
      '</div>'
    );
  }

  function addOrder(payload) {
    var grid = ensureGrid();
    if (grid.querySelector('[data-order-id="' + payload.orderId + '"]')) {
      return;
    }
    var ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.setAttribute('data-order-id', payload.orderId);
    ticket.innerHTML =
      '<div class="ticket__head"><span class="ticket__table">' + escapeHtml(payload.tableNomor) +
      '</span><span class="status-badge status-badge--' + payload.status + '" data-order-status>' + payload.status + '</span></div>' +
      '<div class="ticket__items">' +
      payload.items.map(itemRowHtml).join('') +
      '</div>';
    grid.prepend(ticket);
    updateActiveCount(1);
  }

  var socket = io();

  socket.on('connect', function () {
    if (indicator) {
      indicator.textContent = 'Realtime aktif';
      indicator.className = 'status-badge status-badge--siap';
    }
    socket.emit('join', 'admin');
  });

  socket.on('disconnect', function () {
    if (indicator) {
      indicator.textContent = 'Koneksi terputus, mencoba menyambung lagi…';
      indicator.className = 'status-badge status-badge--baru';
    }
  });

  socket.on('order:new', function (payload) {
    addOrder(payload);
  });
})();
