# PHANTOM Theme — Differentiating Sections Design

> Designed: July 6, 2026
> Status: Draft for review

---

## Overview

Three new sections to differentiate PHANTOM from Impulse/Horizon DNA, focused on conversion and interactivity. Each uses `--ph-color*` CSS variables, full 5-language locale support, `{% style %}` for live editor updates, and `{% javascript %}` for encapsulated JS.

---

## Section 1: Live Urgency Bar

### Purpose
Floating conversion bar showing real-time social proof notifications — recent purchases, low stock alerts, and browsing activity. Drives FOMO (fear of missing out) to increase conversion rate.

### Behavior
- Fixed-position bar at bottom of viewport
- Cycles through configurable notification types
- Auto-dismiss after configurable interval
- Dismissable by user (remembers via localStorage)
- Respects `prefers-reduced-motion`

### Architecture
- **Section file**: `sections/urgency-bar.liquid`
- **JS file**: `assets/urgency-bar.js` (module, `type="module"`)
- **No CSS file** — all styles in `{% style %}` + `{% stylesheet %}` tags

### Settings (Schema)
- Enable/disable toggle
- Position: bottom-left / bottom-right / bottom-center
- Notification display interval (3-15s)
- Max notifications shown simultaneously (1-3)
- Background color, text color, accent color
- 3 notification block types: `purchase`, `low_stock`, `viewing`
- Each block: text template with `{{ product }}`, `{{ name }}`, `{{ time }}` variables

### Technical
- Uses `--ph-colorBody`, `--ph-colorTextBody` from theme variables
- Falls back gracefully if JS disabled (hidden)
- Mobile responsive: full-width on mobile, floating on desktop
- WCAG: touch target >= 44px, aria-live="polite" for notifications

---

## Section 2: Interactive Size Guide

### Purpose
Modal-based size guide with interactive calculator: customer inputs measurements → system recommends size. Reduces returns, builds confidence.

### Architecture
- **Section file**: `sections/size-guide.liquid`
- **Trigger**: Button in product page (render via block or snippet)
- **JS file**: `assets/size-guide.js` (module)
- **CSS**: Inline in section `{% stylesheet %}`

### Settings (Schema)
- Modal heading, intro text
- Measurement unit: inches / cm
- Up to 10 size rows (configurable in blocks)
- Each size block: label, measurements (chest, waist, hip, inseam) as ranges
- Recommended size text template
- Button label and styling
- Background/overlay colors

### Technical
- Uses native `<dialog>` element with polyfill fallback
- Calculator logic: takes 3 inputs (chest, waist, hip) → finds closest match
- Stores last selection in localStorage
- Respects `prefers-reduced-motion`
- Keyboard accessible: ESC to close, focus trap inside modal

### How it renders on PDP
- Includes a snippet `snippets/ph-size-guide-trigger.liquid` that renders a button
- Button triggers the modal from the section
- Section can be placed on template or rendered inline via `{% render %}`

---

## Section 3: Enhanced Product Finder Quiz

### Purpose
Upgrade existing `quiz.liquid` with pro-level UX: animated progress bar, multi-step transitions, better product card rendering, deduplication, and score-based matching instead of pure tag intersection.

### Changes to existing files
- **Modify**: `sections/quiz.liquid` — add progress bar, results step
- **Modify**: `assets/quiz.js` — add animations, score-based logic, progress tracking
- **No new files** for this section

### New features
- Animated progress bar showing current step / total steps
- Smooth slide transitions between questions (exit left, enter right)
- Score-based matching: sum weights per answer tag → recommend top-N products by score
- Deduplication: `uniq` filter on product handles
- Results carousel with actual product cards (price, image, add-to-cart)
- "Start Over" preserves quiz state in sessionStorage

### Settings additions
- `show_progress_bar` toggle
- `progress_bar_color` color picker
- `animation_style` select: slide / fade / none
- `matching_mode` select: tag-intersection (current) / weighted-score (new)

---

## Implementation Order

1. **Live Urgency Bar** — simplest, highest conversion impact, independent
2. **Interactive Size Guide** — modal pattern, moderate complexity
3. **Enhanced Product Finder Quiz** — modifies existing files, most complex

---

## Technical Standards (All Sections)

### CSS
- Use `{% style %}` for color/layout settings that need live editor preview
- Use `{% stylesheet %}` for static styles
- All color references: `var(--ph-color*)` theme variables
- Use logical properties (`inset-inline`, `margin-block`) for RTL support

### JavaScript
- ES modules via `type="module"` pattern
- No jQuery dependencies
- Use `requestAnimationFrame` for animations
- Debounce scroll/resize handlers
- Store state in `data-*` attributes or `sessionStorage`

### Locales
- Keys under `sections.urgency_bar.*`, `sections.size_guide.*`, `sections.enhanced_quiz.*`
- All 5 languages: en.default, de, es, fr, it
- English defaults, give translations via `en.default.schema.json` lookup

### Schema
- Presets included for each section so they appear in theme editor
- `disabled_on`: `["footer", "header", "custom.popups"]` for sections
- Block types with `limit` where appropriate

### Accessibility
- Focus management in modals (focus trap)
- `aria-live="polite"` for dynamic content
- `aria-label` on icon-only buttons
- Keyboard navigation (Tab, Enter, Escape)
- `prefers-reduced-motion` respected
- Touch targets >= 44px

---

## Files to Create/Modify

| File | Action | Type |
|---|---|---|
| `sections/urgency-bar.liquid` | Create | Section |
| `assets/urgency-bar.js` | Create | Asset (JS) |
| `sections/size-guide.liquid` | Create | Section |
| `assets/size-guide.js` | Create | Asset (JS) |
| `snippets/ph-size-guide-trigger.liquid` | Create | Snippet |
| `sections/quiz.liquid` | Modify | Section |
| `assets/quiz.js` | Modify | Asset (JS) |
| `locales/en.default.json` | Modify | Locales |
| `locales/de.json` | Modify | Locales |
| `locales/es.json` | Modify | Locales |
| `locales/fr.json` | Modify | Locales |
| `locales/it.json` | Modify | Locales |
| `locales/en.default.schema.json` | Modify | Schema locales |
| `locales/de.schema.json` | Modify | Schema locales |
| `locales/es.schema.json` | Modify | Schema locales |
| `locales/fr.schema.json` | Modify | Schema locales |
| `locales/it.schema.json` | Modify | Schema locales |

---

*End of design document*
