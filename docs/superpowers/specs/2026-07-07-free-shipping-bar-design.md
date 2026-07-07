# PHANTOM Theme — Multi-Tier Free Shipping Progress Bar Design

> Designed: July 7, 2026
> Status: Draft for review

---

## Overview

A Free Shipping Progress Bar with Multi-Tier Rewards — a PHANTOM-exclusive conversion section. Unlike typical single-threshold bars, this one shows **multiple reward tiers** that unlock as the customer's cart subtotal increases, gamifying the shopping experience and increasing AOV.

### Key Differentiator

Instead of "Free shipping at $100", customers see:
- "$0–$49 → Free Standard at $50 (Save $5)"
- "$50–$99 → Free Express at $100 (Save $12)"
- "$100+ → Free Overnight (Save $25)"

Each tier is configurable by the merchant as a block in the section schema. The bar animates progress between tiers, shows lock/unlock states at each marker, and triggers celebration effects when a new tier is achieved.

---

## Architecture

### Approach: Single Section + Shared Web Component

One source of truth across all placements:

```
sections/free-shipping-bar.liquid     → Section template
assets/free-shipping-bar.js           → Web Component <ph-shipping-bar>
snippets/ph-shipping-bar.liquid       → Snippet for cart drawer embedding
```

- Section renders floating bar when placed on page via theme editor
- Snippet renders same component inline (inside cart drawer, cart page)
- Single Web Component handles both modes via `data-display-mode` attribute
- Consistent UX, DRY code, no duplication

### Display Modes (Configurable)

| Mode | Behavior |
|------|----------|
| `floating` | Fixed-position bar at bottom of viewport |
| `inline` | Embedded in page flow (cart drawer/cart page) |
| `both` | Both floating bar AND inline instance coexist, share state via custom events |

---

## Multi-Tier Architecture

### Tier Model

Each tier is a **block** in the section schema:

| Field | Type | Description |
|-------|------|-------------|
| `threshold` | number | Cart subtotal threshold to unlock (e.g., $50) |
| `label` | text | Reward name ("Free Standard") |
| `description` | text | Incentive copy ("Save $5") |
| `fill_color` | color | Progress bar fill color for this tier's segment |

Blocks are automatically sorted by threshold value (ascending) in JS.

### State Machine

```
[CART EMPTY]
  → Hidden or minimal message

[CART HAS ITEMS < FIRST TIER]
  → "Add $50 more for Free Standard Shipping"
  → Bar fill = (subtotal / first_threshold) * 100%

[CART BETWEEN TIERS]
  → "Free Standard unlocked! Add $50 more for Free Express"
  → Bar fill = progress toward next threshold
  → Tier marker at $50 shows unlocked state (icon swap)

[CART > MAX TIER]
  → "All rewards unlocked! Free Overnight shipping"
  → Full bar, celebration animation (pulsing glow)

[CART UPDATED VIA AJAX]
  → Recalculate tier, animate bar transition (0.4s ease)
  → If new tier unlocked: trigger unlock sequence
```

### Progress Calculation

```javascript
// Sort tiers ascending
const sortedTiers = tiers.sort((a, b) => a.threshold - b.threshold);

// Find current and next tier
let currentTier, nextTier;
for (let i = sortedTiers.length - 1; i >= 0; i--) {
  if (subtotal >= sortedTiers[i].threshold) {
    currentTier = sortedTiers[i];
    nextTier = sortedTiers[i + 1] || null;
    break;
  }
}

// Calculate progress to next threshold
if (nextTier) {
  const progress = ((subtotal - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100;
} else {
  // All tiers unlocked
  const progress = 100;
}
```

---

## Web Component Design

### `<ph-shipping-bar>` API

```html
<ph-shipping-bar
  data-display-mode="floating|inline"
  data-cart-total="{{ cart.total_price | default: 0 }}"
  data-currency="{{ cart.currency.iso_code }}"
  data-animation="{{ section.settings.animation_style }}"
>
  <template data-tier data-threshold="50" data-label="Free Standard" data-description="Save $5" data-fill="#D4A574"></template>
  <template data-tier data-threshold="100" data-label="Free Express" data-description="Save $12" data-fill="#C17B5C"></template>
</ph-shipping-bar>
```

### Lifecycle

1. **`connectedCallback()`**
   - Read display mode, check if should render
   - Read tier data from `<template>` elements
   - Read cached subtotal from `sessionStorage` (prevents flash)
   - Fetch `/cart.js` AJAX for live subtotal
   - Calculate tier, render bar
   - Listen for `cart:updated` event + 5s poll fallback

2. **On each cart update**
   - Re-fetch `/cart.js`
   - Compare new subtotal vs old tier
   - If tier changed: play unlock animation sequence
   - Animate bar fill to new width (CSS transition)
   - Update tier marker icons (lock → unlock)
   - Cache new subtotal to `sessionStorage`

3. **`disconnectedCallback()`**
   - Cleanup: remove event listeners, clear intervals

---

## Section Schema

### Settings

| ID | Type | Default | Description |
|----|------|---------|-------------|
| `enable` | checkbox | true | Toggle entire bar on/off |
| `display_mode` | select | `both` | floating / inline / both |
| `animation_style` | select | `smooth` | smooth / bounce / none |
| `bg_color` | color | `#FFFFFF` | Bar background |
| `text_color` | color | `#1C1D1D` | Text color |
| `empty_bar_color` | color | `#E8E8E8` | Unfilled bar track color |
| `empty_text` | text | — | Text when cart is empty. Variables: `{{ threshold }}` |
| `progress_text` | text | — | Text when progressing to next tier. Variables: `{{ amount }}`, `{{ reward }}` |
| `unlocked_text` | text | — | Text when tier was just unlocked. Variables: `{{ reward }}`, `{{ amount }}`, `{{ next_reward }}` |
| `complete_text` | text | — | Text when all tiers unlocked. Variables: `{{ max_reward }}` |
| `floating_position` | select | `bottom` | bottom / top |

### Blocks (Tiers)

| ID | Type | Default | Description |
|----|------|---------|-------------|
| `threshold` | number | 50 | Cart subtotal threshold |
| `label` | text | "Free Standard" | Reward display label |
| `description` | text | "Save $5" | Incentive description |
| `fill_color` | color | `#D4A574` | This tier's bar fill color |

### Presets

Default preset includes 3 tiers:
- Tier 1: $50 → "Free Standard" (Save $5, `#D4A574`)
- Tier 2: $100 → "Free Express" (Save $12, `#C17B5C`)
- Tier 3: $200 → "Free Overnight" (Save $25, `#A5636C`)

---

## Cart Drawer Integration

### File to Modify

Target: `snippets/cart-drawer.liquid` or equivalent cart drawer footer snippet.

### Injection Point

Above the checkout button, inside the cart drawer footer:

```liquid
{% render 'ph-shipping-bar' %}
```

### How Settings Pass Through

Since snippets don't have access to `section.settings`, the section renders a `<script type="application/json" data-ph-shipping-config>` with the tier data and settings. The Web Component reads this config regardless of whether it was rendered by the section or the snippet.

**JSON config shape:**
```json
{
  "displayMode": "floating|inline|both",
  "animationStyle": "smooth|bounce|none",
  "colors": {
    "bg": "#FFFFFF",
    "text": "#1C1D1D",
    "emptyBar": "#E8E8E8"
  },
  "templates": {
    "progress": "Add {{ amount }} more for {{ reward }}",
    "unlocked": "{{ reward }} unlocked! Add {{ amount }} more for {{ next_reward }}",
    "complete": "All rewards unlocked! {{ max_reward }}"
  },
  "tiers": [
    { "threshold": 50, "label": "Free Standard", "description": "Save $5", "fill": "#D4A574" },
    { "threshold": 100, "label": "Free Express", "description": "Save $12", "fill": "#C17B5C" }
  ],
  "floatingPosition": "bottom"
}
```

The section renders this JSON inline. The snippet re-reads the same global config element. Both instances of `<ph-shipping-bar>` share the same tier data.

---

## Technical Standards

### CSS
- `{% style %}` for editor-live colors (bg, text, empty bar, per-tier fill)
- `{% stylesheet %}` for static layout/animation styles
- `--ph-colorBody`, `--ph-colorTextBody` fallback variables
- Logical properties for RTL (`inset-block`, `margin-inline`)
- `prefers-reduced-motion` respected — disable all animations

### JavaScript
- ES module via `type="module" defer`
- Readable CSS custom property names (`--fsb-bg`, `--fsb-text`, `--fsb-fill`)
- Web Component pattern with `customElements.define`
- `requestAnimationFrame` for smooth bar transitions
- Debounced cart polling (5s interval)
- `sessionStorage` cache to prevent flash on page load
- `cart:updated` event listener for real-time updates

### Locales
- Keys under `sections.free_shipping_bar.*`
- 5 languages: en.default, de, es, fr, it
- English defaults in `en.default.json`
- Schema locale keys in `en.default.schema.json` + translations

### Accessibility
- `aria-live="polite"` on progress text updates
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Keyboard accessible close/dismiss button
- 44px touch targets
- `prefers-reduced-motion` media query respected

### Schema
- Presets included for theme editor visibility
- `disabled_on`: `["footer", "header", "custom.popups"]`
- `limit` on blocks if needed (max 10 tiers)

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `sections/free-shipping-bar.liquid` | Create | Section template |
| `assets/free-shipping-bar.js` | Create | Web Component JS |
| `snippets/ph-shipping-bar.liquid` | Create | Inline render snippet |
| `locales/en.default.json` | Modify | English locale strings |
| `locales/de.json` | Modify | German translations |
| `locales/es.json` | Modify | Spanish translations |
| `locales/fr.json` | Modify | French translations |
| `locales/it.json` | Modify | Italian translations |
| `locales/en.default.schema.json` | Modify | Schema locale keys |
| `locales/de.schema.json` | Modify | Schema locale keys (DE) |
| `locales/es.schema.json` | Modify | Schema locale keys (ES) |
| `locales/fr.schema.json` | Modify | Schema locale keys (FR) |
| `locales/it.schema.json` | Modify | Schema locale keys (IT) |
| `snippets/cart-drawer.liquid` (or equiv) | Modify | Inject shipping bar in cart drawer |

---

## Implementation Order

1. Create `assets/free-shipping-bar.js` — Web Component core
2. Create `sections/free-shipping-bar.liquid` — Section template + schema
3. Create `snippets/ph-shipping-bar.liquid` — Inline renderer
4. Add locale entries (en.default + 4 translations)
5. Modify cart drawer snippet — inject shipping bar
6. Commit

---

*End of design document*
