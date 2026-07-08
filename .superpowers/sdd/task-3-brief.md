# Task 3 Brief: Utility & Promotional Sections (6 files)

**Project context:** PHANTOM Shopify theme Phase 4 — adding `entrance_animation` to remaining sections. Same exact pattern as Tasks 1-2.

**Working directory:** C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0

## Schema block (add to each file's `{% schema %}` settings array)

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

## Data-aos markup

```liquid
data-aos="{% if section.settings.entrance_animation and section.settings.entrance_animation != 'existing' %}{{ section.settings.entrance_animation }}{% endif %}"
```

## Files to modify

### 1. `sections/countdown.liquid`
- Starts with `{% liquid %}` then a conditional outer div
- The always-present wrapper is: `<div class="countdown-wrapper ...">` (multi-line with many classes)
- Add `data-aos` to the `countdown-wrapper` div

### 2. `sections/featured-video.liquid`
- Wrapper: `<div class="page-width">` (after possible `section--divider`)
- Add data-aos there

### 3. `sections/hotspots.liquid`
- Starts with `{% assign %}` and `{% style %}`
- Wrapper: `<div class="index-section {{ section.id }} {{ bgBrightness }}">` (line 52)
- Add data-aos there

### 4. `sections/image-compare.liquid`
- Starts with `{% liquid %}` and `{% style %}`
- Wrapper: `<div class="index-section">` (line 69)
- Add data-aos there

### 5. `sections/advanced-content.liquid`
- Has conditional wrappers (`index-section`, `page-width`)
- Innermost always-present wrapper: `<div class="custom-content">`
- Add data-aos there

### 6. `sections/newsletter.liquid`
- Has `{% style %}` then `{% render 'newsletter-section', section: section %}`
- No wrapper div exists — add one: `<div data-aos="...">{% render 'newsletter-section', section: section %}</div>`

## Do NOT modify
- Any file outside `sections/`

## Report
Write to `.superpowers/sdd/task-3-report.md` with status, commits, verification summary, concerns.
Commit: `feat(phase4): Task 3 - wire entrance_animation to 6 utility sections`
