// LumiBrace — cart helpers (mini Shopify AJAX API wrapper)
(function () {
  'use strict';
  window.LumiCart = {
    async get() {
      const r = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      return r.json();
    },
    async add(form) {
      const formData = new FormData(form);
      const r = await fetch('/cart/add.js', {
        method: 'POST', body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.description || err.message || 'Add to cart failed');
      }
      return r.json();
    },
    async change(line, quantity) {
      const r = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity })
      });
      return r.json();
    },
    updateBadge(count) {
      const el = document.querySelector('[data-cart-count]');
      if (!el) return;
      if (count > 0) { el.textContent = count; el.style.display = ''; }
      else { el.style.display = 'none'; }
    },
    async refreshBadge() {
      try { const c = await this.get(); this.updateBadge(c.item_count); } catch (_) {}
    },
    goToCheckout() {
      // Same-tab redirect — works inside TikTok/Instagram in-app browsers.
      window.location.href = '/checkout';
    },
    goToCart() {
      window.location.href = '/cart';
    }
  };

  document.addEventListener('DOMContentLoaded', () => LumiCart.refreshBadge());
})();
