class UrgencyBar extends HTMLElement {
  connectedCallback() {
    this.notifications = [];
    this.currentIndex = 0;
    this.interval = parseInt(this.dataset.interval) || 5000;
    this.maxItems = parseInt(this.dataset.maxItems) || 1;
    this.storage = this.dataset.storageKey || 'ph-urgency-dismissed';
    this.container = this.querySelector('[data-urgency-notifications]');
    this.closeBtn = this.querySelector('[data-urgency-close]');
    if (localStorage.getItem(this.storage)) { this.remove(); return; }
    this.buildNotifications();
    if (this.notifications.length) {
      this.closeBtn?.addEventListener('click', () => this.dismiss());
      this.startRotation();
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mq.matches;
    mq.addEventListener('change', (e) => { this.reducedMotion = e.matches; });
  }

  buildNotifications() {
    const blocks = this.querySelectorAll('[data-urgency-block]');
    blocks.forEach(b => {
      const type = b.dataset.blockType;
      const template = b.dataset.template;
      const min = parseInt(b.dataset.delayMin) || 0;
      const max = parseInt(b.dataset.delayMax) || 0;
      const delay = min + Math.floor(Math.random() * (max - min + 1));
      const names = (b.dataset.names || '').split(',').filter(Boolean);
      const products = (b.dataset.products || '').split(',').filter(Boolean);
      const name = names.length ? names[Math.floor(Math.random() * names.length)] : 'Someone';
      const product = products.length ? products[Math.floor(Math.random() * products.length)] : '';
      const timeText = delay > 60 ? `${Math.floor(delay / 60)}m ago` : `${delay}s ago`;
      let message = template.replace(/{{ name }}/g, name).replace(/{{ product }}/g, product).replace(/{{ time }}/g, timeText);
      this.notifications.push({ type, message, delay });
    });
  }

  startRotation() {
    this.showNotification(0);
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.notifications.length;
      this.showNotification(this.currentIndex);
    }, this.interval);
  }

  showNotification(index) {
    const n = this.notifications[index];
    const el = document.createElement('div');
    el.className = 'urgency-bar__notification';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = n.message;
    if (!this.reducedMotion) el.style.animation = 'urgencySlideIn 0.3s ease-out';
    this.container.innerHTML = '';
    this.container.appendChild(el);
  }

  dismiss() {
    try { localStorage.setItem(this.storage, 'true'); } catch {}
    clearInterval(this.intervalId);
    this.style.transform = 'translateY(100%)';
    this.style.transition = 'transform 0.3s ease-in';
    setTimeout(() => this.remove(), 300);
  }
}
customElements.define('urgency-bar', UrgencyBar);
