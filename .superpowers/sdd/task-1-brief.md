# Task 1 Brief: Template & Page Sections (10 files)

**Project context:** PHANTOM Shopify theme — Phase 4 adds `entrance_animation` to remaining sections. The PH motion system (ph-motion.js, ph-motion.css) already supports all ph-* animations globally. No JS/CSS/locale changes needed.

**Working directory:** C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0

## Schema block (add to each file's `{% schema %}` settings array, before the closing `]`)

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

## Data-aos markup (add to each file's outermost content wrapper div)

The Liquid conditional:
```liquid
data-aos="{% if section.settings.entrance_animation and section.settings.entrance_animation != 'existing' %}{{ section.settings.entrance_animation }}{% endif %}"
```

## Files to modify

For each file, read it first, then:
1. Add the schema block to the end of the `{% schema %}` settings array
2. Add `data-aos` to the specified wrapper element

### 1. `sections/main-product.liquid`
- Contains `{%- render 'product-template' %}` as the main content
- Find the `{% schema %}` section and add schema block to settings array end
- Add `data-aos` to the outermost content wrapper

### 2. `sections/main-product-high-variant.liquid`
- Add schema block + data-aos on the outermost wrapper

### 3. `sections/main-collection.liquid`
- Wrapper: `<div class="collection-content" ...>`
- schema block + data-aos

### 4. `sections/main-cart.liquid`
- Wrapper: `<div class="page-width page-content">`
- schema block + data-aos

### 5. `sections/main-search.liquid`
- Wrapper: `<div class="search-content" data-section-id="...">`
- schema block + data-aos

### 6. `sections/search-results.liquid`
- Currently just `{% render 'search-results' %}`
- Add: `<div data-aos="...">{% render 'search-results' %}</div>`
- schema block

### 7. `sections/main-page.liquid`
- Wrapper: `<div class="page-width page-width--narrow page-content">`
- schema block + data-aos

### 8. `sections/main-page-full-width.liquid`
- Wrapper: `<div class="page-full page-content">`
- schema block + data-aos

### 9. `sections/main-404.liquid`
- Wrapper: `<div class="page-width page-content">`
- schema block + data-aos

### 10. `sections/product-full-width.liquid`
- Wrapper: `<div class="page-width{% if section.settings.max_width %} page-width--narrow{% endif %}">`
- schema block + data-aos

## Do NOT modify
- Any file outside `sections/`
- `assets/`, `config/`, `layout/`, `locales/`

## Verification
After editing each file, verify entrances_animation appears in both schema and markup:
```bash
Select-String -LiteralPath "sections/FILE.liquid" -Pattern "entrance_animation"
```

## Report
Write results to `.superpowers/sdd/task-1-report.md` with:
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made (hashes)
- One-line test summary
- Any concerns
