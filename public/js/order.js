(function () {
  'use strict';

  var slug = window.ORDER_SLUG;
  var cart = {}; // menuItemId -> { qty, nama, harga }

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-menu-item]'));
  var cartBar = document.getElementById('cart-bar');
  var cartCount = document.getElementById('cart-count');
  var cartTotal = document.getElementById('cart-total');
  var cartError = document.getElementById('cart-error');
  var submitBtn = document.getElementById('submit-order');

  function formatRupiah(n) {
    return 'Rp' + Math.round(n).toLocaleString('id-ID');
  }

  function updateSummary() {
    var count = 0;
    var total = 0;
    Object.keys(cart).forEach(function (id) {
      count += cart[id].qty;
      total += cart[id].qty * cart[id].harga;
    });
    if (count > 0) {
      cartBar.hidden = false;
      cartCount.textContent = count + ' item';
      cartTotal.textContent = formatRupiah(total);
    } else {
      cartBar.hidden = true;
    }
  }

  function setQty(el, qty) {
    var id = el.getAttribute('data-id');
    var nama = el.getAttribute('data-nama');
    var harga = Number(el.getAttribute('data-harga'));
    var valueEl = el.querySelector('[data-qty-value]');
    var minusBtn = el.querySelector('[data-qty-minus]');

    qty = Math.max(0, Math.min(50, qty));
    valueEl.textContent = String(qty);
    minusBtn.disabled = qty === 0;

    if (qty === 0) {
      delete cart[id];
    } else {
      cart[id] = { qty: qty, nama: nama, harga: harga };
    }
    updateSummary();
  }

  items.forEach(function (el) {
    var tersedia = el.getAttribute('data-tersedia') === 'true';
    if (!tersedia) {
      return;
    }
    var plusBtn = el.querySelector('[data-qty-plus]');
    var minusBtn = el.querySelector('[data-qty-minus]');
    var valueEl = el.querySelector('[data-qty-value]');

    plusBtn.addEventListener('click', function () {
      var current = Number(valueEl.textContent) || 0;
      setQty(el, current + 1);
    });
    minusBtn.addEventListener('click', function () {
      var current = Number(valueEl.textContent) || 0;
      setQty(el, current - 1);
    });
  });

  function showError(message) {
    cartError.textContent = message;
    cartError.hidden = false;
  }

  function hideError() {
    cartError.hidden = true;
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      hideError();
      var payloadItems = Object.keys(cart).map(function (id) {
        return { menuItemId: id, qty: cart[id].qty };
      });
      if (payloadItems.length === 0) {
        showError('Keranjang masih kosong. Tambahkan minimal satu item.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Mengirim pesanan…';

      fetch('/order/' + encodeURIComponent(slug) + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error(result.data && result.data.error ? result.data.error : 'Gagal mengirim pesanan');
          }
          window.location.href = '/order/' + encodeURIComponent(slug) + '/status/' + result.data.id;
        })
        .catch(function (err) {
          showError(err.message || 'Gagal mengirim pesanan. Periksa koneksi lalu coba lagi.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Pesan Sekarang';
        });
    });
  }
})();
