# PHANTOM Differentiating Sections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement. Checkboxes for tracking.

**Goal:** Build 3 pro-level sections to differentiate PHANTOM from Impulse the

**Architecture:** Each section is self-contained (section.liquid + .js asset), uses `--ph-color*` CSS variables, `{% style %}` for live editor updates, ES modules, native `<dialog>` for modals

**Tech Stack:** Shopify Liquid, ES modules, CSS custom properties, Native `<dialog>` API

## Global Constraints
- All CSS variables use `--ph-*` prefix (existing theme convention)
- All user-facing text via `{{ 'key' | t }}` with locale entries
- ES modules with `type="module"` and `defer`
- `{% style %}` for editor-live colors, `{% stylesheet %}` for static CSS
- WCAG: 44px touch targets, focus management, aria-live, prefers-reduced-motion
- 5 languages: en.default, de, es, fr, it

---

### Task 1: Live Urgency Bar — Section + JS

**Files:**
- Create: `sections/urgency-bar.liquid`
- Create: `assets/urgency-bar.js`
- Modify: `locales/en.default.json`
- Modify: `locales/de.json`, `es.json`, `fr.json`, `it.json`

**Interfaces:**
- Consumes: `--ph-colorBody`, `--ph-colorTextBody` CSS variables
- Produces: Section usable via theme editor or `{% section 'urgency-bar' %}`

- [ ] **Step 1: Create `assets/urgency-bar.js`**

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

- [ ] **Step 2: Create `sections/urgency-bar.liquid`**

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

- [ ] **Step 3: Add locale entries for urgency bar**

Add to `locales/en.default.json`:
```json
"sections": {
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
}
```

Add to `locales/de.json`, `es.json`, `fr.json`, `it.json` with translated values.

- [ ] **Step 4: Commit**

```bash
git add sections/urgency-bar.liquid assets/urgency-bar.js locales/en.default.json locales/de.json locales/es.json locales/fr.json locales/it.json
git commit -m "feat: add Urgency Bar section"
```

---

### Task 2: Interactive Size Guide — Section + JS + Trigger Snippet

**Files:**
- Create: `sections/size-guide.liquid`
- Create: `assets/size-guide.js`
- Create: `snippets/ph-size-guide-trigger.liquid`
- Modify: `locales/en.default.json` (+ de, es, fr, it)

**Interfaces:**
- Section renders hidden modal HTML
- Snippet renders trigger button anywhere (typically PDP)
- JS handles open/close/calculate

- [ ] **Step 1: Create `assets/size-guide.js`**

```javascript
class SizeGuideModal extends HTMLElement {
  connectedCallback() {
    const dialog = this.querySelector('dialog');
    const openTriggers = document.querySelectorAll('[data-open-size-guide]');
    const closeBtn = this.querySelector('[data-size-close]');
    const inputs = this.querySelectorAll('[data-size-input]');
    const result = this.querySelector('[data-size-result]');
    const sizeRows = this.querySelectorAll('[data-size-row]');

    if (!dialog) return;

    openTriggers.forEach(t => t.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }));

    closeBtn?.addEventListener('click', () => this.close(dialog));

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) this.close(dialog);
    });

    dialog.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialog.open) {
        this.close(dialog);
      }
    });

    inputs.forEach(input => {
      input.addEventListener('input', () => this.calculate(inputs, sizeRows, result));
    });
  }

  close(dialog) {
    dialog.close();
    document.body.style.overflow = '';
  }

  calculate(inputs, rows, resultEl) {
    const vals = Array.from(inputs).map(i => parseFloat(i.value) || 0);
    if (vals.some(v => v === 0)) { resultEl.textContent = ''; resultEl.classList.add('is-hidden'); return; }

    let bestMatch = null;
    let bestDiff = Infinity;

    rows.forEach(row => {
      const chestMin = parseFloat(row.dataset.chestMin || 0);
      const chestMax = parseFloat(row.dataset.chestMax || 999);
      const waistMin = parseFloat(row.dataset.waistMin || 0);
      const waistMax = parseFloat(row.dataset.waistMax || 999);
      const hipMin = parseFloat(row.dataset.hipMin || 0);
      const hipMax = parseFloat(row.dataset.hipMax || 999);

      if (vals[0] >= chestMin && vals[0] <= chestMax &&
          vals[1] >= waistMin && vals[1] <= waistMax &&
          vals[2] >= hipMin && vals[2] <= hipMax) {
        const diff = Math.abs(vals[0] - (chestMin + chestMax) / 2) +
                     Math.abs(vals[1] - (waistMin + waistMax) / 2) +
                     Math.abs(vals[2] - (hipMin + hipMax) / 2);
        if (diff < bestDiff) { bestDiff = diff; bestMatch = row; }
      }
    });

    if (bestMatch) {
      resultEl.textContent = bestMatch.dataset.recommendation || 'This size fits you best';
      resultEl.classList.remove('is-hidden');
    } else {
      resultEl.textContent = 'No exact match found. Try your closest measurements or contact us for help.';
      resultEl.classList.remove('is-hidden');
    }
  }
}
customElements.define('size-guide-modal', SizeGuideModal);
```

- [ ] **Step 2: Create `sections/size-guide.liquid`**

```liquid
{% style %}
  #size-guide-{{ section.id }} dialog {
    --sg-bg: {{ section.settings.bg_color }};
    --sg-text: {{ section.settings.text_color }};
    --sg-accent: {{ section.settings.accent_color }};
  }
{% endstyle %}

<size-guide-modal id="size-guide-{{ section.id }}" class="size-guide">
  <dialog class="size-guide__dialog" aria-labelledby="sg-heading-{{ section.id }}">
    <div class="size-guide__inner">
      <div class="size-guide__header">
        <h2 id="sg-heading-{{ section.id }}" class="size-guide__heading">{{ section.settings.heading }}</h2>
        <button class="size-guide__close" data-size-close type="button" aria-label="{{ 'sections.size_guide.close' | t }}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 2l16 16M18 2L2 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      {% if section.settings.intro_text != blank %}
        <div class="size-guide__intro rte">{{ section.settings.intro_text }}</div>
      {% endif %}

      <div class="size-guide__calculator" data-size-calculator>
        <div class="size-guide__inputs">
          <div class="size-guide__field">
            <label for="sg-chest-{{ section.id }}">{{ 'sections.size_guide.chest' | t }}</label>
            <input id="sg-chest-{{ section.id }}" type="number" inputmode="decimal" step="0.1" placeholder="cm" data-size-input class="size-guide__input">
          </div>
          <div class="size-guide__field">
            <label for="sg-waist-{{ section.id }}">{{ 'sections.size_guide.waist' | t }}</label>
            <input id="sg-waist-{{ section.id }}" type="number" inputmode="decimal" step="0.1" placeholder="cm" data-size-input class="size-guide__input">
          </div>
          <div class="size-guide__field">
            <label for="sg-hip-{{ section.id }}">{{ 'sections.size_guide.hip' | t }}</label>
            <input id="sg-hip-{{ section.id }}" type="number" inputmode="decimal" step="0.1" placeholder="cm" data-size-input class="size-guide__input">
          </div>
        </div>
        <div class="size-guide__result is-hidden" data-size-result></div>
      </div>

      {% if section.blocks.size > 0 %}
        <div class="size-guide__table-wrapper">
          <table class="size-guide__table">
            <thead>
              <tr>
                <th>{{ 'sections.size_guide.table.size' | t }}</th>
                <th>{{ 'sections.size_guide.table.chest' | t }}</th>
                <th>{{ 'sections.size_guide.table.waist' | t }}</th>
                <th>{{ 'sections.size_guide.table.hip' | t }}</th>
              </tr>
            </thead>
            <tbody>
              {% for block in section.blocks %}
                <tr data-size-row
                  data-chest-min="{{ block.settings.chest_min }}"
                  data-chest-max="{{ block.settings.chest_max }}"
                  data-waist-min="{{ block.settings.waist_min }}"
                  data-waist-max="{{ block.settings.waist_max }}"
                  data-hip-min="{{ block.settings.hip_min }}"
                  data-hip-max="{{ block.settings.hip_max }}"
                  data-recommendation="{{ block.settings.recommendation | escape }}"
                >
                  <td>{{ block.settings.label }}</td>
                  <td>{{ block.settings.chest_min }}–{{ block.settings.chest_max }}</td>
                  <td>{{ block.settings.waist_min }}–{{ block.settings.waist_max }}</td>
                  <td>{{ block.settings.hip_min }}–{{ block.settings.hip_max }}</td>
                </tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
      {% endif %}
    </div>
  </dialog>
</size-guide-modal>

{% stylesheet %}
  .size-guide__dialog {
    border: none;
    border-radius: 12px;
    padding: 0;
    max-width: 640px;
    width: calc(100% - 32px);
    max-height: 85vh;
    overflow-y: auto;
    background: var(--sg-bg, var(--ph-colorBody, #fff));
    color: var(--sg-text, var(--ph-colorTextBody, #1c1d1d));
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .size-guide__dialog::backdrop { background: rgba(0,0,0,0.5); }
  .size-guide__inner { padding: 32px; }
  .size-guide__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .size-guide__heading { margin: 0; font-size: 1.5em; }
  .size-guide__close {
    background: none; border: none; cursor: pointer; padding: 8px; color: inherit; opacity: 0.6; transition: opacity 0.2s; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;
  }
  .size-guide__close:hover { opacity: 1; }
  .size-guide__intro { margin-bottom: 24px; font-size: 0.95em; opacity: 0.8; }
  .size-guide__inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .size-guide__field { display: flex; flex-direction: column; gap: 4px; }
  .size-guide__field label { font-size: 0.85em; font-weight: 600; }
  .size-guide__input {
    padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--sg-text), transparent 80%); border-radius: 6px; font-size: 1em; background: transparent; color: inherit; width: 100%; box-sizing: border-box;
  }
  .size-guide__input:focus { outline: 2px solid var(--sg-accent); outline-offset: 1px; }
  .size-guide__result {
    padding: 12px 16px; background: color-mix(in srgb, var(--sg-accent), transparent 90%); border-radius: 8px; font-weight: 600; margin-bottom: 20px;
  }
  .size-guide__table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
  .size-guide__table th, .size-guide__table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid color-mix(in srgb, var(--sg-text), transparent 88%); }
  .size-guide__table th { font-weight: 600; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
  .is-hidden { display: none; }
  @media (max-width: 480px) {
    .size-guide__inputs { grid-template-columns: 1fr; }
    .size-guide__inner { padding: 20px; }
  }
{% endstylesheet %}

<script src="{{ 'size-guide.js' | asset_url }}" type="module" defer></script>

{% schema %}
{
  "name": "t:sections.size_guide.name",
  "class": "shopify-section--size-guide",
  "settings": [
    { "type": "text", "id": "heading", "label": "t:sections.size_guide.settings.heading", "default": "Size Guide" },
    { "type": "richtext", "id": "intro_text", "label": "t:sections.size_guide.settings.intro_text", "default": "<p>Enter your measurements to find your perfect fit.</p>" },
    { "type": "header", "content": "t:sections.size_guide.settings.header_colors" },
    { "type": "color", "id": "bg_color", "label": "t:sections.size_guide.settings.bg_color", "default": "#FFFFFF" },
    { "type": "color", "id": "text_color", "label": "t:sections.size_guide.settings.text_color", "default": "#1C1D1D" },
    { "type": "color", "id": "accent_color", "label": "t:sections.size_guide.settings.accent_color", "default": "#D4A574" }
  ],
  "blocks": [
    {
      "type": "size",
      "name": "t:sections.size_guide.blocks.size.name",
      "settings": [
        { "type": "text", "id": "label", "label": "t:sections.size_guide.blocks.size.settings.label", "default": "S" },
        { "type": "range", "id": "chest_min", "min": 0, "max": 200, "step": 0.5, "default": 86, "label": "t:sections.size_guide.blocks.size.settings.chest_min" },
        { "type": "range", "id": "chest_max", "min": 0, "max": 200, "step": 0.5, "default": 91, "label": "t:sections.size_guide.blocks.size.settings.chest_max" },
        { "type": "range", "id": "waist_min", "min": 0, "max": 200, "step": 0.5, "default": 71, "label": "t:sections.size_guide.blocks.size.settings.waist_min" },
        { "type": "range", "id": "waist_max", "min": 0, "max": 200, "step": 0.5, "default": 76, "label": "t:sections.size_guide.blocks.size.settings.waist_max" },
        { "type": "range", "id": "hip_min", "min": 0, "max": 200, "step": 0.5, "default": 86, "label": "t:sections.size_guide.blocks.size.settings.hip_min" },
        { "type": "range", "id": "hip_max", "min": 0, "max": 200, "step": 0.5, "default": 91, "label": "t:sections.size_guide.blocks.size.settings.hip_max" },
        { "type": "text", "id": "recommendation", "label": "t:sections.size_guide.blocks.size.settings.recommendation", "default": "Size S is recommended for you" }
      ]
    }
  ],
  "presets": [{
    "name": "t:sections.size_guide.presets.name",
    "blocks": [
      { "type": "size", "settings": { "label": "XS", "chest_min": 76, "chest_max": 81, "waist_min": 61, "waist_max": 66, "hip_min": 81, "hip_max": 86, "recommendation": "Size XS recommended" } },
      { "type": "size", "settings": { "label": "S", "chest_min": 86, "chest_max": 91, "waist_min": 71, "waist_max": 76, "hip_min": 86, "hip_max": 91, "recommendation": "Size S recommended" } },
      { "type": "size", "settings": { "label": "M", "chest_min": 96, "chest_max": 101, "waist_min": 81, "waist_max": 86, "hip_min": 96, "hip_max": 101, "recommendation": "Size M recommended" } },
      { "type": "size", "settings": { "label": "L", "chest_min": 106, "chest_max": 111, "waist_min": 91, "waist_max": 96, "hip_min": 106, "hip_max": 111, "recommendation": "Size L recommended" } },
      { "type": "size", "settings": { "label": "XL", "chest_min": 116, "chest_max": 121, "waist_min": 101, "waist_max": 106, "hip_min": 116, "hip_max": 121, "recommendation": "Size XL recommended" } }
    ]
  }],
  "disabled_on": { "groups": ["footer", "header", "custom.popups"] }
}
{% endschema %}
```

- [ ] **Step 3: Create `snippets/ph-size-guide-trigger.liquid`**

```liquid
{% doc %}
Renders a button that opens the Size Guide modal.
@param {string} label - Button text (default: "Size Guide")
@param {string} section_id - ID of the size-guide section
@example
{% render 'ph-size-guide-trigger', section_id: section.id %}
{% enddoc %}

<button type="button" class="btn btn--secondary btn--small" data-open-size-guide>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 6px;"><path d="M2 4h20v16H2z"/><path d="M6 8v8M10 8v8M14 8v8M18 8v8"/><path d="M2 12h20"/></svg>
  {{ label | default: 'sections.size_guide.trigger_label' | t }}
</button>
```

- [ ] **Step 4: Add locale entries for size guide** (similar structure to urgency bar)

- [ ] **Step 5: Commit**

```bash
git add sections/size-guide.liquid assets/size-guide.js snippets/ph-size-guide-trigger.liquid locales/en.default.json locales/de.json locales/es.json locales/fr.json locales/it.json
git commit -m "feat: add Interactive Size Guide section + trigger snippet"
```

---

### Task 3: Enhanced Product Finder Quiz — Upgrade Existing

**Files:**
- Modify: `sections/quiz.liquid`
- Modify: `assets/quiz.js`
- Modify: `locales/en.default.json` (+ de, es, fr, it)

- [ ] **Step 1: Rewrite `assets/quiz.js` with pro features**

Enhanced with: progress bar, slide animations, score-based matching, deduplication, sessionStorage persistence.

```javascript
class QuizRecommendation extends HTMLElement {
  connectedCallback() {
    this.intro = this.querySelector('[data-quiz-intro]');
    this.questions = Array.from(this.querySelectorAll('[data-quiz-question]'));
    this.results = this.querySelector('[data-quiz-results]');
    this.cards = this.querySelector('[data-quiz-cards]');
    this.progress = this.querySelector('[data-quiz-progress]');
    this.progressFill = this.querySelector('[data-quiz-progress-fill]');
    this.noResults = this.querySelector('[data-quiz-no-results]');
    this.resetBtn = this.querySelector('[data-quiz-reset]');
    this.startBtn = this.querySelector('[data-quiz-start]');
    this.productsToShow = parseInt(this.dataset.productsToShow) || 3;

    this.scores = {};
    this.currentQuestion = 0;
    this.animationStyle = this.dataset.animationStyle || 'slide';
    this.matchingMode = this.dataset.matchingMode || 'intersection';

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mq.matches;
    mq.addEventListener('change', (e) => { this.reducedMotion = e.matches; });

    this.startBtn?.addEventListener('click', () => this.start());
    this.resetBtn?.addEventListener('click', () => this.reset());

    this.questions.forEach((q, i) => {
      q.querySelectorAll('[data-quiz-option]').forEach(opt => {
        opt.addEventListener('click', () => this.selectOption(i, opt));
      });
    });
  }

  start() {
    this.intro.classList.add('is-hidden');
    this.showQuestion(0);
  }

  showQuestion(index) {
    if (index >= this.questions.length) { this.showResults(); return; }
    this.questions.forEach((q, i) => {
      q.classList.toggle('is-hidden', i !== index);
      if (!this.reducedMotion) {
        q.style.animation = i === index ? 'quizFadeIn 0.4s ease forwards' : '';
      }
    });
    this.currentQuestion = index;
    this.updateProgress();
  }

  updateProgress() {
    if (!this.progress || !this.progressFill) return;
    const pct = ((this.currentQuestion + 1) / this.questions.length) * 100;
    this.progressFill.style.width = `${pct}%`;
  }

  selectOption(questionIndex, opt) {
    const handles = (opt.dataset.productHandles || '').split(',').filter(Boolean);
    const weight = parseFloat(opt.dataset.weight) || 1;
    handles.forEach(h => { this.scores[h] = (this.scores[h] || 0) + weight; });
    this.showQuestion(questionIndex + 1);
  }

  async showResults() {
    this.questions.forEach(q => q.classList.add('is-hidden'));

    const sorted = Object.entries(this.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.productsToShow);

    if (sorted.length === 0) {
      this.noResults?.classList.remove('is-hidden');
      this.results.classList.remove('is-hidden');
      return;
    }

    this.results.classList.remove('is-hidden');
    if (!this.reducedMotion) this.results.style.animation = 'quizFadeIn 0.5s ease forwards';

    const slotPromises = sorted.map(([handle], i) => this.fetchProduct(handle, i));
    await Promise.all(slotPromises);
  }

  async fetchProduct(handle, index) {
    const slot = this.querySelector(`[data-quiz-card-slot="${index}"]`);
    if (!slot) return;
    slot.classList.add('is-loading');
    try {
      const cached = sessionStorage.getItem(`ph-quiz-${handle}`);
      if (cached) { slot.innerHTML = cached; slot.classList.remove('is-loading'); return; }
      const res = await fetch(`${window.Shopify?.routes?.root || '/'}products/${handle}.js`);
      if (!res.ok) throw new Error('not found');
      const p = await res.json();
      const html = `<div class="quiz-product-card">
        <a href="/products/${p.handle}">
          <img src="${p.featured_image || ''}" alt="${p.title}" loading="lazy" width="200" height="200" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px">
        </a>
        <h4 style="margin:8px 0 4px;font-size:0.95em"><a href="/products/${p.handle}" style="color:inherit;text-decoration:none">${p.title}</a></h4>
        <span style="font-weight:600">${Shopify.formatMoney(p.price)}</span>
        <form method="post" action="/cart/add" style="margin-top:8px">
          <input type="hidden" name="id" value="${p.variants[0]?.id}">
          <input type="hidden" name="quantity" value="1">
          <button type="submit" class="btn btn--small btn--full" style="width:100%">Add to Cart</button>
        </form>
      </div>`;
      try { sessionStorage.setItem(`ph-quiz-${handle}`, html); } catch {}
      slot.innerHTML = html;
    } catch {
      slot.innerHTML = '';
    }
    slot.classList.remove('is-loading');
  }

  reset() {
    this.scores = {};
    this.currentQuestion = 0;
    this.results.classList.add('is-hidden');
    this.noResults?.classList.add('is-hidden');
    this.intro.classList.remove('is-hidden');
    this.querySelectorAll('[data-quiz-card-slot]').forEach(s => s.innerHTML = '');
    this.updateProgress();
  }
}
customElements.define('quiz-recommendation', QuizRecommendation);
```

- [ ] **Step 2: Update `sections/quiz.liquid`**

Add progress bar after intro, add `data-quiz-progress` / `data-quiz-progress-fill` markup, add `weight` data attributes to options, add animation style to wrapper, add matching mode.

Insert progress bar between intro and questions:
```liquid
<div class="quiz-progress" data-quiz-progress{% unless section.settings.show_progress_bar %} style="display:none"{% endunless %}>
  <div class="quiz-progress__bar">
    <div class="quiz-progress__fill" data-quiz-progress-fill style="width:0%;background:{{ section.settings.progress_bar_color }}"></div>
  </div>
  <span class="quiz-progress__label" data-quiz-progress-label>1 / {{ section.blocks.size }}</span>
</div>
```

Add `data-animation-style` / `data-matching-mode` / `data-products-to-show` to `<quiz-recommendation>` element.

Add weight input to option settings in schema (optional float, default 1.0).

Add new settings: `show_progress_bar`, `progress_bar_color`, `animation_style`, `matching_mode`.

Add progress bar CSS to stylesheet.

- [ ] **Step 3: Add locale entries for enhanced quiz** (progress bar label, animation style, matching mode, weight)

- [ ] **Step 4: Commit**

```bash
git add sections/quiz.liquid assets/quiz.js locales/en.default.json locales/de.json locales/es.json locales/fr.json locales/it.json
git commit -m "feat: enhance Product Finder Quiz with progress bar, scoring, animations"
```

---

*End of implementation plan*
