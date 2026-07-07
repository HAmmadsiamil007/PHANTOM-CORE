# Phase 5 — Bug Fix + Polish

**Date:** 2026-07-07  
**Theme:** PHANTOM v2.2.0  
**Status:** Design

---

## 1. Objective

Fix bugs (one introduced by us, two pre-existing), fill Portuguese locale gap, wire two remaining snippet-based sections, and expand skeleton loader variants.

---

## 2. Scope

### 2.1 Bug Fixes

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `sections/newsletter.liquid` | **Duplicate `"settings"` array** — `entrance_animation` inserted as a new array (line 235) instead of appended to existing array (line 83-234) | Move the `entrance_animation` block into the existing settings array and remove the duplicate |
| 2 | `sections/quiz.liquid` | **Liquid syntax error** — `data-weight="{{ block.settings.option_{{ i }}_weight }}"` has nested `{{ }}` | Replace with `{% capture %}` + bracket-style `block.settings[key]` access |
| 3 | `sections/size-guide.liquid` | **Range step too small** — 6 range fields use `step: 0.5` with `min: 0, max: 200` = 401 steps (Shopify limit ~100) | Change all range `step` from `0.5` to `1` |

### 2.2 Portuguese Locale Files

Create new files (mirror `en.default.schema.json` structure, translated labels):

| File | Description |
|------|-------------|
| `locales/pt-BR.schema.json` | Brazilian Portuguese schema translations |
| `locales/pt-PT.schema.json` | European Portuguese schema translations |

Includes: `settings_schema.ph_motion` section (all labels), plus other `t:sections.*.settings.*` and `settings_schema.*.settings.*` keys found in `en.default.schema.json`.

### 2.3 Wire Snippet-Based Sections

| File | Change |
|------|--------|
| `sections/announcement.liquid` | Add wrapper `<div>` around `{% render 'announcement-bar' %}`, add `entrance_animation` schema block, add `data-aos` |
| `sections/scrolling-text.liquid` | Add wrapper `<div>` around `{% render 'scrolling-text' %}`, add `entrance_animation` schema block, add `data-aos` |

### 2.4 Skeleton Loader Expansion

| File | Additions |
|------|-----------|
| `assets/ph-skeleton.css.liquid` | `.ph-skeleton--avatar` (circular, 48x48), `.ph-skeleton--button` (rect, 120x40), `.ph-skeleton--table-row` (multi-line), CSS custom property `--ph-shimmer-color` for shimmer highlight |

---

## 3. Files NOT Modified

- `assets/ph-motion.js.liquid` — no changes
- `assets/ph-motion.css.liquid` — no changes
- `config/settings_schema.json` — no changes
- `layout/theme.liquid` — no changes
- All previously wired sections — no regressions

---

## 4. Verification

- `newsletter.liquid` schema JSON has exactly one `"settings"` array with `entrance_animation` inside it
- `quiz.liquid` — `data-weight` no longer has nested `{{ }}`
- `size-guide.liquid` — all range settings use `step: 1`
- `locales/pt-BR.schema.json` + `pt-PT.schema.json` exist with valid JSON
- `announcement.liquid` + `scrolling-text.liquid` have `entrance_animation` in schema and `data-aos` on wrapper
- `ph-skeleton.css.liquid` has new variant selectors and `--ph-shimmer-color` CSS var
- Shopify CLI push succeeds with no errors
