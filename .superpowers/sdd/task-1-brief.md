# Task 1: Live Urgency Bar

## Context
This is a Shopify theme (PHANTOM v2.2.0) at `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\`. You are adding a new "Urgency Bar" section — a floating conversion bar showing social proof notifications.

## Requirements (from plan)
- Create: `sections/urgency-bar.liquid` — full section with schema, presets, styles
- Create: `assets/urgency-bar.js` — ES module custom element (`<urgency-bar>`)
- Modify: `locales/en.default.json` — add translations under `sections.urgency_bar.*`
- Modify: `locales/de.json`, `es.json`, `fr.json`, `it.json` — add translations

## Exact Code

### assets/urgency-bar.js
```javascript
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
```

### sections/urgency-bar.liquid
Full section with `{% style %}`, `{% stylesheet %}`, schema with blocks (purchase, low_stock, viewing), presets.

```liquid
{% style %}
  #urgency-bar-{{ section.id }} {
    --urgency-bg: {{ section.settings.background_color }};
    --urgency-text: {{ section.settings.text_color }};
    --urgency-accent: {{ section.settings.accent_color }};
    --urgency-position: {{ section.settings.position }};
  }
{% endstyle %}

<urgency-bar
  id="urgency-bar-{{ section.id }}"
  class="urgency-bar"
  data-interval="{{ section.settings.notification_interval | times: 1000 }}"
  data-max-items="{{ section.settings.max_notifications }}"
  data-storage-key="ph-urgency-dismissed-{{ section.id }}"
  style="
    --urgency-bg: {{ section.settings.background_color }};
    --urgency-text: {{ section.settings.text_color }};
    --urgency-accent: {{ section.settings.accent_color }};
  "
>
  <div class="urgency-bar__inner">
    {% if section.settings.show_close %}
      <button class="urgency-bar__close" data-urgency-close type="button" aria-label="{{ 'sections.urgency_bar.close' | t }}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    {% endif %}
    <div class="urgency-bar__notifications" data-urgency-notifications></div>
    {% for block in section.blocks %}
      <div
        data-urgency-block
        data-block-type="{{ block.type }}"
        data-template="{{ block.settings.text_template | escape }}"
        data-delay-min="{{ block.settings.delay_min }}"
        data-delay-max="{{ block.settings.delay_max }}"
        data-names="{{ block.settings.names }}"
        data-products="{{ block.settings.products }}"
        hidden
      ></div>
    {% endfor %}
  </div>
</urgency-bar>

{% stylesheet %}
  .urgency-bar {
    position: fixed;
    z-index: 9999;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 420px;
    width: calc(100% - 40px);
    background: var(--urgency-bg, var(--ph-colorBody, #fff));
    color: var(--urgency-text, var(--ph-colorTextBody, #1c1d1d));
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    padding: 12px 40px 12px 16px;
    font-size: 14px;
    line-height: 1.4;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .urgency-bar__inner { position: relative; }
  .urgency-bar__close {
    position: absolute;
    top: 50%;
    right: -24px;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 8px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .urgency-bar__close:hover { opacity: 1; }
  .urgency-bar__notification {
    animation: urgencySlideIn 0.3s ease-out;
  }
  @keyframes urgencySlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .urgency-bar__notification { animation: none; }
    .urgency-bar { transition: none; }
  }
  @media (min-width: 768px) {
    .urgency-bar { max-width: 400px; }
  }
{% endstylesheet %}

<script src="{{ 'urgency-bar.js' | asset_url }}" type="module" defer></script>

{% schema %}
{
  "name": "t:sections.urgency_bar.name",
  "class": "shopify-section--urgency-bar",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_close",
      "label": "t:sections.urgency_bar.settings.show_close",
      "default": true
    },
    {
      "type": "range",
      "id": "notification_interval",
      "label": "t:sections.urgency_bar.settings.notification_interval",
      "min": 3,
      "max": 15,
      "step": 1,
      "default": 5,
      "unit": "s"
    },
    {
      "type": "range",
      "id": "max_notifications",
      "label": "t:sections.urgency_bar.settings.max_notifications",
      "min": 1,
      "max": 3,
      "step": 1,
      "default": 1
    },
    {
      "type": "select",
      "id": "position",
      "label": "t:sections.urgency_bar.settings.position",
      "default": "bottom-center",
      "options": [
        { "value": "bottom-left", "label": "t:sections.urgency_bar.settings.position.options.bottom_left" },
        { "value": "bottom-center", "label": "t:sections.urgency_bar.settings.position.options.bottom_center" },
        { "value": "bottom-right", "label": "t:sections.urgency_bar.settings.position.options.bottom_right" }
      ]
    },
    {
      "type": "header",
      "content": "t:sections.urgency_bar.settings.header_colors"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "t:sections.urgency_bar.settings.background_color",
      "default": "#FFFFFF"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "t:sections.urgency_bar.settings.text_color",
      "default": "#1C1D1D"
    },
    {
      "type": "color",
      "id": "accent_color",
      "label": "t:sections.urgency_bar.settings.accent_color",
      "default": "#D4A574"
    }
  ],
  "blocks": [
    {
      "type": "purchase",
      "name": "t:sections.urgency_bar.blocks.purchase.name",
      "settings": [
        { "type": "text", "id": "text_template", "label": "t:sections.urgency_bar.blocks.purchase.settings.text_template", "default": "{{ name }} just purchased {{ product }}", "info": "t:sections.urgency_bar.blocks.purchase.settings.text_template_info" },
        { "type": "text", "id": "names", "label": "t:sections.urgency_bar.blocks.purchase.settings.names", "default": "Sarah, Mike, Emma, James, Olivia", "info": "t:sections.urgency_bar.blocks.purchase.settings.names_info" },
        { "type": "text", "id": "products", "label": "t:sections.urgency_bar.blocks.purchase.settings.products" },
        { "type": "range", "id": "delay_min", "min": 0, "max": 120, "step": 5, "default": 5, "label": "t:sections.urgency_bar.blocks.purchase.settings.delay_min" },
        { "type": "range", "id": "delay_max", "min": 0, "max": 360, "step": 5, "default": 60, "label": "t:sections.urgency_bar.blocks.purchase.settings.delay_max" }
      ]
    },
    {
      "type": "low_stock",
      "name": "t:sections.urgency_bar.blocks.low_stock.name",
      "settings": [
        { "type": "text", "id": "text_template", "label": "t:sections.urgency_bar.blocks.low_stock.settings.text_template", "default": "Only {{ product }} left in stock — low stock", "info": "t:sections.urgency_bar.blocks.low_stock.settings.text_template_info" },
        { "type": "text", "id": "products", "label": "t:sections.urgency_bar.blocks.low_stock.settings.products" },
        { "type": "range", "id": "delay_min", "min": 0, "max": 120, "step": 5, "default": 10, "label": "t:sections.urgency_bar.blocks.low_stock.settings.delay_min" },
        { "type": "range", "id": "delay_max", "min": 0, "max": 360, "step": 5, "default": 120, "label": "t:sections.urgency_bar.blocks.low_stock.settings.delay_max" }
      ]
    },
    {
      "type": "viewing",
      "name": "t:sections.urgency_bar.blocks.viewing.name",
      "settings": [
        { "type": "text", "id": "text_template", "label": "t:sections.urgency_bar.blocks.viewing.settings.text_template", "default": "{{ name }} is viewing {{ product }}", "info": "t:sections.urgency_bar.blocks.viewing.settings.text_template_info" },
        { "type": "text", "id": "names", "label": "t:sections.urgency_bar.blocks.viewing.settings.names", "default": "Alex, Jordan, Taylor, Casey, Riley", "info": "t:sections.urgency_bar.blocks.viewing.settings.names_info" },
        { "type": "text", "id": "products", "label": "t:sections.urgency_bar.blocks.viewing.settings.products" },
        { "type": "range", "id": "delay_min", "min": 0, "max": 60, "step": 1, "default": 0, "label": "t:sections.urgency_bar.blocks.viewing.settings.delay_min" },
        { "type": "range", "id": "delay_max", "min": 0, "max": 120, "step": 5, "default": 30, "label": "t:sections.urgency_bar.blocks.viewing.settings.delay_max" }
      ]
    }
  ],
  "presets": [
    {
      "name": "t:sections.urgency_bar.presets.name",
      "blocks": [
        { "type": "purchase" },
        { "type": "viewing" }
      ]
    }
  ],
  "disabled_on": { "groups": ["footer", "header", "custom.popups"] }
}
{% endschema %}
```

### Locales to add

Add this under `"sections"` in each locale file:

```json
"urgency_bar": {
  "name": "Urgency Bar",
  "close": "Close",
  "settings": {
    "show_close": "Show close button",
    "notification_interval": "Notification interval",
    "max_notifications": "Max notifications at once",
    "position": "Position",
    "position": { "options": { "bottom_left": "Bottom left", "bottom_center": "Bottom center", "bottom_right": "Bottom right" } },
    "header_colors": "Colors",
    "background_color": "Background",
    "text_color": "Text",
    "accent_color": "Accent"
  },
  "blocks": {
    "purchase": {
      "name": "Recent Purchase",
      "settings": {
        "text_template": "Notification text",
        "text_template_info": "Use {{ name }}, {{ product }}, {{ time }} as placeholders",
        "names": "Customer names (comma-separated)",
        "names_info": "Random name will be picked from this list",
        "products": "Product names (comma-separated)",
        "delay_min": "Min delay (seconds)",
        "delay_max": "Max delay (seconds)"
      }
    },
    "low_stock": {
      "name": "Low Stock Alert",
      "settings": {
        "text_template": "Notification text",
        "text_template_info": "Use {{ product }} and {{ time }} as placeholders",
        "products": "Product names (comma-separated)",
        "delay_min": "Min delay (seconds)",
        "delay_max": "Max delay (seconds)"
      }
    },
    "viewing": {
      "name": "Live Viewing",
      "settings": {
        "text_template": "Notification text",
        "text_template_info": "Use {{ name }}, {{ product }}, {{ time }} as placeholders",
        "names": "Customer names (comma-separated)",
        "names_info": "Random name will be picked from this list",
        "products": "Product names (comma-separated)",
        "delay_min": "Min delay (seconds)",
        "delay_max": "Max delay (seconds)"
      }
    }
  },
  "presets": { "name": "Urgency Bar" }
}
```

For `de.json` translate values to German. For `es.json` → Spanish. For `fr.json` → French. For `it.json` → Italian.

## Report Contract
Write a report to `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\.superpowers\sdd\task-1-report.md` containing:
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made (hashes)
- Test summary (any Shopify validation you ran)
- Any concerns you have

## Do NOT
- Modify any existing section/snippet files beyond the 5 locale files
- Add any files beyond those listed
- Refactor any existing code
