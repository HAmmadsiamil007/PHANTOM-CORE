# PHANTOM Motion System — Design Doc

> Designed: July 7, 2026
> Status: Draft for review

---

## Overview

The PHANTOM Motion System is a 3-layer enhancement that transforms the theme from a static Impulse clone into a modern, animated, premium-feeling theme. Each layer is independent and can be shipped separately.

### Why This Matters

1. **Differentiation:** Impulse (and all Archetype themes) have zero scroll-triggered animations, skeleton loading, or page transitions. Adding these makes PHANTOM feel like a completely different theme — visually and experientially.

2. **Anti-Detectability:** The animation JS, new CSS classes, new schema settings, and restructured rendering add thousands of lines of non-Impulse code. Theme detection tools look at code fingerprints — new code patterns break those fingerprints.

3. **Business Value:** "Scroll-triggered animations" and "cinematic page transitions" are selling points that premium themes charge $350+ for. Skeleton loaders improve perceived performance (LCP, CLS metrics).

4. **Developer Experience:** The motion system can be used during theme development to preview loading states and section reveals.

### The Three Layers

```
PHANTOM Motion System
├── Layer 1: Entrance Animation Engine       ← HIGHEST impact
│   ├── Scroll-triggered fade/slide/scale animations on 15 key sections
│   ├── IntersectionObserver-based, respects prefers-reduced-motion
│   ├── Configurable per-section via theme editor
│   └── 7 animation types: fade-up, fade-down, fade-left, fade-right, scale-in, zoom-in, none
│
├── Layer 2: Skeleton Loading + Page Transitions  ← UX polish
│   ├── Skeleton placeholders for 6 key section types
│   ├── View Transitions API for SPA-like page navigation
│   ├── Skeleton → content transition (fade overlap)
│   └── Progressive enhancement — View Transitions fallback to normal load
│
└── Layer 3: Theme Presets                    ← Merchant value
    ├── 4 complete style presets: Minimal, Editorial, Bold, Luxury
    ├── One-click switching via Theme Settings
    ├── Each preset sets all colors, fonts, and layout options
    └── Pure JSON — no code changes, just settings_data.json entries
```

---

## Layer 1: Entrance Animation Engine

### Architecture

A single Web Component `<ph-motion>` that observes all `[data-ph-animate]` elements and adds a visible class when they enter the viewport.

```
assets/ph-motion.js              → Web Component + IntersectionObserver
assets/ph-motion.css.liquid      → @keyframes + CSS classes
```

No modifications to theme.liquid — the section includes the JS/CSS assets when needed.

### How Sections Opt In

Each of the ~15 target sections gets:
1. A new schema setting `entrance_animation` (select dropdown)
2. The setting value rendered as `data-ph-animate="{{ section.settings.entrance_animation }}"`
3. The section's wrapper element gets `class="ph-motion"` as a base class

### Animation Types

| Value | CSS Transform | Opacity | Duration |
|-------|--------------|---------|----------|
| `fade-up` | translateY(30px) → translateY(0) | 0 → 1 | 0.6s |
| `fade-down` | translateY(-30px) → translateY(0) | 0 → 1 | 0.6s |
| `fade-left` | translateX(-30px) → translateX(0) | 0 → 1 | 0.6s |
| `fade-right` | translateX(30px) → translateX(0) | 0 → 1 | 0.6s |
| `scale-in` | scale(0.95) → scale(1) | 0 → 1 | 0.5s |
| `zoom-in` | scale(0.8) → scale(1) | 0 → 1 | 0.7s |

### JavaScript Engine

```javascript
class PHMotion extends HTMLElement {
  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ph-motion--visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -100px 0px', threshold: 0.1 }
    );
    this.querySelectorAll('[data-ph-animate]').forEach(el => {
      if (el.dataset.phAnimate !== 'none') this.observer.observe(el);
    });
  }
  disconnectedCallback() { this.observer?.disconnect(); }
}
customElements.define('ph-motion', PHMotion);
```

### CSS

```css
[data-ph-animate] {
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-ph-animate].ph-motion--visible {
  opacity: 1;
  transform: translate(0, 0) scale(1);
}
[data-ph-animate="fade-up"]    { transform: translateY(30px); }
[data-ph-animate="fade-down"]  { transform: translateY(-30px); }
[data-ph-animate="fade-left"]  { transform: translateX(-30px); }
[data-ph-animate="fade-right"] { transform: translateX(30px); }
[data-ph-animate="scale-in"]   { transform: scale(0.95); }
[data-ph-animate="zoom-in"]    { transform: scale(0.8); transition-duration: 0.7s; }
```

### Schema Setting (added to each target section)

```json
{
  "type": "header",
  "content": "t:settings_schema.ph_motion.header"
},
{
  "type": "select",
  "id": "entrance_animation",
  "label": "t:settings_schema.ph_motion.entrance_animation",
  "default": "none",
  "options": [
    { "value": "none", "label": "t:settings_schema.ph_motion.animation_options.none" },
    { "value": "fade-up", "label": "t:settings_schema.ph_motion.animation_options.fade_up" },
    { "value": "fade-down", "label": "t:settings_schema.ph_motion.animation_options.fade_down" },
    { "value": "fade-left", "label": "t:settings_schema.ph_motion.animation_options.fade_left" },
    { "value": "fade-right", "label": "t:settings_schema.ph_motion.animation_options.fade_right" },
    { "value": "scale-in", "label": "t:settings_schema.ph_motion.animation_options.scale_in" },
    { "value": "zoom-in", "label": "t:settings_schema.ph_motion.animation_options.zoom_in" }
  ]
}
```

### Sections to Animate (15 total)

| Section | Notes |
|---------|-------|
| `slideshow.liquid` | First slide should animate, rest auto-play |
| `hero-video.liquid` | Animate on load |
| `background-image-text.liquid` | Text overlay animated |
| `background-video-text.liquid` | Text overlay animated |
| `featured-collection.liquid` | Grid cards stagger in |
| `featured-collections.liquid` | Collection cards stagger |
| `featured-product.liquid` | Image + info animate |
| `blog-posts.liquid` | Article cards stagger |
| `testimonials.liquid` | Quote cards stagger |
| `text-and-image.liquid` | Both sides animate |
| `media-text.liquid` | Both sides animate |
| `text-columns.liquid` | Columns stagger |
| `text-with-icons.liquid` | Icons stagger |
| `promo-grid.liquid` | Grid items stagger |
| `rich-text.liquid` | Simple fade |
| `advanced-content.liquid` | Sections stagger |

Additional sections get the setting later — not in initial build.

---

## Layer 2: Skeleton Loading + Page Transitions

### Page Transitions with View Transitions API

File: `assets/ph-transitions.js`

```javascript
class PHPageTransitions {
  constructor() {
    if (!document.startViewTransition) return;
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || link.host !== location.host || link.hasAttribute('download')) return;
      if (link.target === '_blank' || link.getAttribute('rel') === 'external') return;
      e.preventDefault();
      document.startViewTransition(() => {
        location.href = link.href;
      });
    });
  }
}
new PHPageTransitions();
```

CSS in `assets/ph-transitions.css.liquid`:
```css
::view-transition-old(root) { animation: 0.3s ease-out both ph-fade-out; }
::view-transition-new(root) { animation: 0.3s ease-in both ph-fade-in; }
@keyframes ph-fade-out { to { opacity: 0; } }
@keyframes ph-fade-in { from { opacity: 0; } to { opacity: 1; } }
```

Loaded in `theme.liquid`:
```liquid
{{ 'ph-transitions.js' | asset_url | script_tag }}
{{ 'ph-transitions.css.liquid' | asset_url | stylesheet_tag }}
```

### Skeleton Loading — Scope & Use Cases

**Important context:** Shopify themes are server-rendered — section HTML is already in the DOM on page load. A skeleton that shows THEN replaces existing content would cause a visible flash. Therefore, skeletons are useful in two specific scenarios:

**Use Case 1: View Transitions (page-to-page)**
When navigating between pages via View Transitions API, the destination page's content isn't painted yet. Show a full-page skeleton during the ~300ms transition to give visual continuity. The skeleton matches the layout of the page being navigated to.

**Use Case 2: AJAX-Dependent Sections**
Some sections load content asynchronously:
- `product-recommendations.liquid` — fetches via Shopify API
- `recently-viewed.liquid` — builds from localStorage + API
- Cart drawer content — loads via `/cart.js`

These sections already have a "loading" moment where JS fetches data. Skeletons fill that gap.

### Skeleton Files

6 skeleton snippet files for key section types:

| Snippet | Use Case |
|---------|----------|
| `snippets/ph-skeleton-hero.liquid` | View Transition — first paint placeholder |
| `snippets/ph-skeleton-collection-grid.liquid` | View Transition — product grid placeholder |
| `snippets/ph-skeleton-featured-product.liquid` | View Transition — PDP placeholder |
| `snippets/ph-skeleton-blog-posts.liquid` | View Transition — blog grid placeholder |
| `snippets/ph-skeleton-card.liquid` | AJAX — generic product card loading state |
| `snippets/ph-skeleton-cart-item.liquid` | AJAX — cart drawer line item loading state |

Each skeleton renders a shimmer animation:
```html
<div class="ph-skeleton ph-skeleton--hero" aria-hidden="true">
  <div class="ph-skeleton__shimmer"></div>
  <div class="ph-skeleton__block" style="height: 60vh; border-radius: 0;"></div>
</div>
```

**Integration for View Transitions:**
- During `document.startViewTransition()`, the `ph-transitions.js` renders a skeleton overlay
- The overlay matches the target page's section layout (hero skeleton for homepage, grid skeleton for collection, etc.)
- When the new page's DOM is painted, the skeleton fades out (0.3s)

**Integration for AJAX sections:**
- The Web Component checks for a `<template class="ph-skeleton-template">` inside the section
- If found AND the section has no data yet, clone the template as a placeholder
- When AJAX resolves, fade out skeleton (0.3s), fade in content (0.3s)

```liquid
{% if request.design_mode == false %}
  <template class="ph-skeleton-template">
    {% render 'ph-skeleton-card' %}
  </template>
{% endif %}
```

**Loading orchestration:**
- `PHMotion` Web Component handles the skeleton → content transition
- Skeleton fade-out: 0.3s, content fade-in: 0.3s, 0.1s overlap
- Not applied to sections that render server-side (no flash needed)
- Respects `prefers-reduced-motion` — instantaneous swap

---

## Layer 3: Theme Presets

### Preset Configuration

4 entries in `settings_data.json`:

```json
{
  "current": "PHANTOM Minimal",
  "presets": {
    "PHANTOM Minimal": {
      "ph_color_body_bg": "#FFFFFF",
      "ph_color_body_text": "#1C1D1D",
      "ph_color_button": "#000000",
      "ph_color_button_text": "#FFFFFF",
      "type_header_font": "Work Sans",
      "type_base_font": "Work Sans",
      ...
    },
    "PHANTOM Editorial": {
      "ph_color_body_bg": "#F5F0EB",
      "ph_color_body_text": "#2D2A26",
      "ph_color_button": "#8B4513",
      "ph_color_button_text": "#FFFFFF",
      "type_header_font": "Playfair Display",
      "type_base_font": "Lora",
      ...
    },
    "PHANTOM Bold": {
      "ph_color_body_bg": "#0A0A0A",
      "ph_color_body_text": "#FFFFFF",
      "ph_color_button": "#00FF88",
      "ph_color_button_text": "#0A0A0A",
      "type_header_font": "Archivo Black",
      "type_base_font": "Inter",
      ...
    },
    "PHANTOM Luxury": {
      "ph_color_body_bg": "#0D1B2A",
      "ph_color_body_text": "#E8DCCC",
      "ph_color_button": "#C9A96E",
      "ph_color_button_text": "#0D1B2A",
      "type_header_font": "Cormorant Garamond",
      "type_base_font": "Montserrat",
      ...
    }
  }
}
```

### How Merchants Switch

1. Go to Theme Settings → "PHANTOM Style Presets"
2. A new settings section with a select dropdown
3. Selecting a preset updates all color/font fields
4. Changes are previewed in real-time
5. Click "Save" to apply

The presets section in `settings_schema.json`:
```json
{
  "name": "t:settings_schema.ph_presets.name",
  "settings": [
    {
      "type": "paragraph",
      "content": "t:settings_schema.ph_presets.description"
    },
    {
      "type": "select",
      "id": "ph_style_preset",
      "label": "t:settings_schema.ph_presets.preset",
      "default": "minimal",
      "options": [
        { "value": "minimal", "label": "PHANTOM Minimal" },
        { "value": "editorial", "label": "PHANTOM Editorial" },
        { "value": "bold", "label": "PHANTOM Bold" },
        { "value": "luxury", "label": "PHANTOM Luxury" }
      ]
    }
  ]
}
```

Note: Presets are guidance + initial setup. The merchant can freely customize after selecting. Theme presets in Shopify 2.0 don't have a one-click-apply system natively — they work by providing `settings_data.json` with multiple preset objects. The actual switching requires the merchant to change individual settings or use a custom mechanism. We'll document the values so merchants can copy them manually, OR build a small JS toggle that applies preset values as an enhancement.

---

## Technical Standards

### CSS
- `{% stylesheet %}` for static animation styles
- `{% style %}` is NOT needed for animations (no editor-live color needed)
- All animation classes prefixed with `ph-motion--`
- All skeleton classes prefixed with `ph-skeleton--`
- `prefers-reduced-motion` — disable ALL animations
- Use `will-change: transform, opacity` on animated elements

### JavaScript
- ES modules with `type="module" defer`
- Web Component pattern for motion observer
- `IntersectionObserver` with `rootMargin: '0px 0px -100px 0px'`
- `requestAnimationFrame` for smooth transitions
- Debounced resize handler
- `sessionStorage` for dismissing transition intro

### Locales
- Keys under `settings_schema.ph_motion.*` for animation settings
- Keys under `settings_schema.ph_presets.*` for preset settings
- 5 languages: en.default, de, es, fr, it
- Skeleton labels in `sections.*` namespace (minimal text needed)

### Accessibility
- `prefers-reduced-motion` — ALL animations must respect this
- Skeleton loaders must have `aria-hidden="true"`
- Motion elements must not affect keyboard navigation
- `data-ph-animate="none"` is the default (merchant opts in)
- View Transitions must not break keyboard focus management
- Touch targets >= 44px

### Schema
- New tab `ph_motion` in `settings_schema.json` for global motion settings
- Per-section `entrance_animation` setting added individually
- `disabled_on` inherits from parent section setting
- Presets tab `ph_presets` for the style preset selector

---

## Files to Create/Modify

| File | Action | Layer |
|------|--------|-------|
| `assets/ph-motion.js` | Create | 1 |
| `assets/ph-motion.css.liquid` | Create | 1 |
| `assets/ph-transitions.js` | Create | 2 |
| `assets/ph-transitions.css.liquid` | Create | 2 |
| `snippets/ph-skeleton-hero.liquid` | Create | 2 |
| `snippets/ph-skeleton-collection-grid.liquid` | Create | 2 |
| `snippets/ph-skeleton-featured-product.liquid` | Create | 2 |
| `snippets/ph-skeleton-blog-posts.liquid` | Create | 2 |
| `snippets/ph-skeleton-text-image.liquid` | Create | 2 |
| `snippets/ph-skeleton-footer.liquid` | Create | 2 |
| `layout/theme.liquid` | Modify | 2 |
| `config/settings_schema.json` | Modify | 1, 3 |
| `config/settings_data.json` | Modify | 3 |
| `locales/en.default.schema.json` | Modify | 1, 3 |
| `locales/de.schema.json` | Modify | 1, 3 |
| `locales/es.schema.json` | Modify | 1, 3 |
| `locales/fr.schema.json` | Modify | 1, 3 |
| `locales/it.schema.json` | Modify | 1, 3 |
| `sections/slideshow.liquid` | Modify | 1 |
| `sections/hero-video.liquid` | Modify | 1 |
| `sections/background-image-text.liquid` | Modify | 1 |
| `sections/background-video-text.liquid` | Modify | 1 |
| `sections/featured-collection.liquid` | Modify | 1 |
| `sections/featured-collections.liquid` | Modify | 1 |
| `sections/featured-product.liquid` | Modify | 1 |
| `sections/blog-posts.liquid` | Modify | 1 |
| `sections/testimonials.liquid` | Modify | 1 |
| `sections/text-and-image.liquid` | Modify | 1 |
| `sections/media-text.liquid` | Modify | 1 |
| `sections/text-columns.liquid` | Modify | 1 |
| `sections/text-with-icons.liquid` | Modify | 1 |
| `sections/promo-grid.liquid` | Modify | 1 |
| `sections/rich-text.liquid` | Modify | 1 |
| `sections/advanced-content.liquid` | Modify | 1 |

---

## Implementation Order

1. **Layer 1 — Animation Engine:** Create ph-motion.js + ph-motion.css.liquid. Add `entrance_animation` setting to 15 sections. Test on dev store.
2. **Layer 2 — Page Transitions:** Create ph-transitions.js + ph-transitions.css.liquid. Add to theme.liquid. Test navigation flow.
3. **Layer 2 — Skeleton Loaders:** Create 6 skeleton snippets. Add `<template>` integration to target sections. Test loading flow.
4. **Layer 3 — Theme Presets:** Add 4 presets to settings_data.json. Add presets tab to settings_schema.json. Test preset switching.
5. **Locale updates:** Add all translation keys across 5 languages.
6. **Commit & push.**

---

*End of design document*
