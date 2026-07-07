# Phase 5 — Bug Fix + Polish Implementation Plan

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal:** Fix 3 bugs, fill Portuguese locale gap, wire 2 snippet sections, expand skeleton variants.

**Architecture:** All changes are surgical — move/delete schema blocks, fix Liquid expressions, create locale files, add CSS selectors.

**Tech Stack:** Shopify Liquid, CSS, JSON

## Global Constraints

- All JS is ES5-compatible (var, function — no const/let/arrow)
- `prefers-reduced-motion` + `[data-disable-animations=true]` guards intact
- Schema JSON must be valid at all times
- Files outside specified list: NOT modified

---

### Task 1: Fix newsletter.liquid Duplicate Settings (CRITICAL)

**Files:**
- Modify: `sections/newsletter.liquid`

**Problem:** `entrance_animation` is in a second `"settings"` array (line 235-251). In Shopify schema JSON, having two sibling `"settings"` arrays is invalid — the second one silently overwrites the first or causes a parse error.

**Fix:**
- Move the `entrance_animation` block (lines 237-249) into the first settings array (lines 83-234), inserting before line 233 (the last setting before the closing `]`)
- Remove the duplicate `"settings"` array at lines 235-251 (including the `"settings": [` and `],` lines)

The entrance_animation block to move:
```json
      {
        "type": "select",
        "id": "entrance_animation",
        "label": "t:sections.common.settings.entrance_animation.label",
        "default": "existing",
        "options": [
          { "value": "existing", "label": "t:sections.common.settings.entrance_animation.options.existing.label" },
          { "value": "ph-fade-up", "label": "t:sections.common.settings.entrance_animation.options.ph-fade-up.label" },
          { "value": "ph-scale-in", "label": "t:sections.common.settings.entrance_animation.options.ph-scale-in.label" },
          { "value": "ph-blur-in", "label": "t:sections.common.settings.entrance_animation.options.ph-blur-in.label" },
          { "value": "ph-slide-left", "label": "t:sections.common.settings.entrance_animation.options.ph-slide-left.label" },
          { "value": "ph-slide-right", "label": "t:sections.common.settings.entrance_animation.options.ph-slide-right.label" },
          { "value": "ph-rotate-in", "label": "t:sections.common.settings.entrance_animation.options.ph-rotate-in.label" }
        ]
      }
```

Add a trailing comma to the `bottom_padding` setting (line 233) before inserting.

- [ ] **Step 1**: Read `sections/newsletter.liquid` fully
- [ ] **Step 2**: At line 233, change `"default": true }` → `"default": true },` (add comma)
- [ ] **Step 3**: Insert entrance_animation block after the modified line 233 (before the `]` at line 234)
- [ ] **Step 4**: Delete lines 235-251 (the duplicate `"settings": [` through its closing `],`)
- [ ] **Step 5**: Verify JSON validity — check `"settings"` appears only ONCE in the file
- [ ] **Step 6**: Verify `entrance_animation` still present in both schema and markup

```bash
Select-String -LiteralPath "sections/newsletter.liquid" -Pattern '"settings"' | Measure-Object -Line
Select-String -LiteralPath "sections/newsletter.liquid" -Pattern "entrance_animation"
```

- [ ] **Step 7**: Commit

```bash
git add sections/newsletter.liquid
git commit -m "fix(phase5): Task 1 - merge duplicate settings array in newsletter.liquid"
```

---

### Task 2: Fix quiz.liquid Liquid Syntax Error

**Files:**
- Modify: `sections/quiz.liquid`

**Problem:** Line 345 has `data-weight="{{ block.settings.option_{{ i }}_weight }}"` — nested `{{ }}` is invalid Liquid.

**Fix:** Replace with bracket-style dynamic key access.

- [ ] **Step 1**: Read `sections/quiz.liquid` around line 340-355
- [ ] **Step 2**: Replace the current attribute:
```liquid
                    data-weight="{{ block.settings.option_{{ i }}_weight }}"
```
With:
```liquid
                    {%- capture weight_key -%}option_{{ i }}_weight{%- endcapture -%}
                    data-weight="{{ block.settings[weight_key] }}"
```

- [ ] **Step 3**: Verify

```bash
Select-String -LiteralPath "sections/quiz.liquid" -Pattern "option_{{"
```

Should return 0 results.

- [ ] **Step 4**: Commit

```bash
git add sections/quiz.liquid
git commit -m "fix(phase5): Task 2 - fix nested Liquid tags in quiz.liquid"
```

---

### Task 3: Fix size-guide.liquid Range Steps

**Files:**
- Modify: `sections/size-guide.liquid`

**Problem:** All 6 range fields use `"step": 0.5` with `"min": 0, "max": 200` = 401 steps. Shopify limits ranges to ~100 steps.

**Fix:** Change `"step": 0.5` to `"step": 1` everywhere in the file.

- [ ] **Step 1**: Read `sections/size-guide.liquid` around the range settings
- [ ] **Step 2**: Replace all instances of `"step": 0.5` with `"step": 1` (should be 6 occurrences)

```bash
Select-String -LiteralPath "sections/size-guide.liquid" -Pattern '"step"'
```

- [ ] **Step 3**: Commit

```bash
git add sections/size-guide.liquid
git commit -m "fix(phase5): Task 3 - fix range step precision in size-guide.liquid"
```

---

### Task 4: Create Portuguese Locale Files

**Files:**
- Create: `locales/pt-BR.schema.json`
- Create: `locales/pt-PT.schema.json`

**Approach:** Create `.schema.json` files mirroring the structure of `en.default.schema.json`. Use English text as content (Shopify falls back gracefully). The files must be valid JSON with the exact same key structure.

- [ ] **Step 1**: Read `locales/en.default.schema.json` — extract its structure
- [ ] **Step 2**: Create `locales/pt-BR.schema.json` — same structure, English text (placeholder until merchant translates)
- [ ] **Step 3**: Create `locales/pt-PT.schema.json` — same structure, English text
- [ ] **Step 4**: Verify both files are valid JSON

```bash
$j1 = Get-Content "locales/pt-BR.schema.json" -Raw | ConvertFrom-Json
$j2 = Get-Content "locales/pt-PT.schema.json" -Raw | ConvertFrom-Json
Write-Host "Both valid JSON"
```

- [ ] **Step 5**: Commit

```bash
git add locales/pt-BR.schema.json locales/pt-PT.schema.json
git commit -m "feat(phase5): Task 4 - add Portuguese locale schema files"
```

---

### Task 5: Wire announcement + scrolling-text

**Files:**
- Modify: `sections/announcement.liquid`
- Modify: `sections/scrolling-text.liquid`

Both files delegate to a snippet without a wrapper div. Add a wrapper with `data-aos` + add `entrance_animation` schema block.

**Schema block (same as all other sections):**
```json
      {
        "type": "select",
        "id": "entrance_animation",
        "label": "t:sections.common.settings.entrance_animation.label",
        "default": "existing",
        "options": [
          { "value": "existing", "label": "t:sections.common.settings.entrance_animation.options.existing.label" },
          { "value": "ph-fade-up", "label": "t:sections.common.settings.entrance_animation.options.ph-fade-up.label" },
          { "value": "ph-scale-in", "label": "t:sections.common.settings.entrance_animation.options.ph-scale-in.label" },
          { "value": "ph-blur-in", "label": "t:sections.common.settings.entrance_animation.options.ph-blur-in.label" },
          { "value": "ph-slide-left", "label": "t:sections.common.settings.entrance_animation.options.ph-slide-left.label" },
          { "value": "ph-slide-right", "label": "t:sections.common.settings.entrance_animation.options.ph-slide-right.label" },
          { "value": "ph-rotate-in", "label": "t:sections.common.settings.entrance_animation.options.ph-rotate-in.label" }
        ]
      }
```

**Wrapper pattern for announcement (`sections/announcement.liquid`):**
After the `</style>` block (line 7), wrap the render tag:
```liquid
<div data-aos="{% if section.settings.entrance_animation and section.settings.entrance_animation != 'existing' %}{{ section.settings.entrance_animation }}{% endif %}">
  {%- render 'announcement-bar', section: section -%}
</div>
```

**Wrapper pattern for scrolling-text (`sections/scrolling-text.liquid`):**
```liquid
<div data-aos="{% if section.settings.entrance_animation and section.settings.entrance_animation != 'existing' %}{{ section.settings.entrance_animation }}{% endif %}">
  {% render 'scrolling-text', section: section %}
</div>
```

- [ ] **Step 1**: Read `sections/announcement.liquid` fully
- [ ] **Step 2**: Add wrapper div + schema block
- [ ] **Step 3**: Read `sections/scrolling-text.liquid` fully
- [ ] **Step 4**: Add wrapper div + schema block
- [ ] **Step 5**: Verify

```bash
foreach ($f in @("announcement","scrolling-text")) { Select-String -LiteralPath "sections/$f.liquid" -Pattern "entrance_animation" }
```

- [ ] **Step 6**: Commit

```bash
git add sections/announcement.liquid sections/scrolling-text.liquid
git commit -m "feat(phase5): Task 5 - wire announcement and scrolling-text sections"
```

---

### Task 6: Expand Skeleton Loader Variants

**Files:**
- Modify: `assets/ph-skeleton.css.liquid`

**Additions after existing `.ph-skeleton--section` block (before the reduced-motion media query):**

```css
.ph-skeleton--avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ph-skeleton--button {
  width: 120px;
  height: 40px;
  border-radius: var(--btn-radius, 4px);
}

.ph-skeleton--table-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.ph-skeleton--table-row .ph-skeleton--text {
  flex: 1;
}

.ph-skeleton--table-row .ph-skeleton--text-short {
  flex: 0 0 60px;
}
```

**CSS custom property for shimmer color:**
Replace hardcoded `rgba(255,255,255,0.4)` in `.ph-skeleton::after` with `var(--ph-shimmer-color, rgba(255,255,255,0.4))`.

- [ ] **Step 1**: Read `assets/ph-skeleton.css.liquid` fully
- [ ] **Step 2**: Add new variant selectors after `.ph-skeleton--section` block
- [ ] **Step 3**: Replace hardcoded shimmer color with CSS custom property
- [ ] **Step 4**: Verify selectors present

```bash
foreach ($s in @("avatar","button","table-row","ph-shimmer-color")) { Select-String -Path "assets/ph-skeleton.css.liquid" -Pattern $s }
```

- [ ] **Step 5**: Commit

```bash
git add assets/ph-skeleton.css.liquid
git commit -m "feat(phase5): Task 6 - expand skeleton variants, add shimmer CSS var"
```

---

### Task 7: Full Verification + Push

- [ ] **All sections with entrance_animation verified (44 now)**

```bash
$wired = @("main-product","main-product-high-variant","main-collection","main-cart","main-search","search-results","main-page","main-page-full-width","main-404","product-full-width","blog-template","article-template","collection-header","collection-return","list-collections-template","contact-form","faq","countdown","featured-video","hotspots","image-compare","advanced-content","newsletter","announcement","scrolling-text")
$missing = @()
foreach ($f in $wired) { $match = Select-String -LiteralPath "sections/$f.liquid" -Pattern "entrance_animation" -Quiet; if (-not $match) { $missing += $f } }
if ($missing.Count -eq 0) { Write-Host "ALL $($wired.Count) SECTIONS VERIFIED" } else { Write-Host "MISSING: $($missing -join ', ')" }
```

- [ ] **Infrastructure files unchanged**

```bash
git diff 4adc84c..HEAD -- assets/ph-motion.js.liquid assets/ph-motion.css.liquid config/settings_schema.json layout/theme.liquid
```

- [ ] **Push to Shopify**

```bash
shopify theme push --store phantom-x931aakm.myshopify.com --theme 150689677402 --allow-live
```

- [ ] **Commit any remaining changes**
