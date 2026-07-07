# Task 2: Interactive Size Guide

## Context
Shopify theme (PHANTOM v2.2.0) at `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\`. You are adding a Size Guide section with an interactive calculator modal.

## Files to Create/Modify
- **Create**: `sections/size-guide.liquid`
- **Create**: `assets/size-guide.js`
- **Create**: `snippets/ph-size-guide-trigger.liquid`
- **Modify**: `locales/en.default.json` — add `sections.size_guide.*`
- **Modify**: `locales/de.json`, `es.json`, `fr.json`, `it.json`

## Locale structure
Add under `"sections"` key:
```json
"size_guide": {
  "name": "Size Guide",
  "close": "Close",
  "trigger_label": "Size Guide",
  "chest": "Chest (cm)",
  "waist": "Waist (cm)",
  "hip": "Hip (cm)",
  "table": {
    "size": "Size",
    "chest": "Chest",
    "waist": "Waist",
    "hip": "Hip"
  },
  "settings": {
    "heading": "Heading",
    "intro_text": "Intro text",
    "header_colors": "Colors",
    "bg_color": "Background",
    "text_color": "Text",
    "accent_color": "Accent"
  },
  "blocks": {
    "size": {
      "name": "Size Row",
      "settings": {
        "label": "Size label",
        "chest_min": "Chest min",
        "chest_max": "Chest max",
        "waist_min": "Waist min",
        "waist_max": "Waist max",
        "hip_min": "Hip min",
        "hip_max": "Hip max",
        "recommendation": "Recommendation text"
      }
    }
  },
  "presets": { "name": "Size Guide" }
}
```
For `de.json` → German, `es.json` → Spanish, `fr.json` → French, `it.json` → Italian.

## assets/size-guide.js
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

## sections/size-guide.liquid
Full section using native `<dialog>` with calculator, size table, schema with blocks.

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

## snippets/ph-size-guide-trigger.liquid
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

## Report
Write to: `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\.superpowers\sdd\task-2-report.md`
Format: Same as Task 1 — Status, commit hash, summary, concerns.

## Do NOT
- Modify files outside the list
- Touch any existing section/snippet/asset
- Refactor anything