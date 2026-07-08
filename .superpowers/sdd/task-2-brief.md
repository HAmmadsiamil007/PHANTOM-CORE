# Task 2 Brief: Content & Blog Sections (7 files)

**Project context:** PHANTOM Shopify theme Phase 4 — adding `entrance_animation` to remaining sections. Same exact pattern as Task 1 (which wired 10 template sections).

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

## Data-aos markup

```liquid
data-aos="{% if section.settings.entrance_animation and section.settings.entrance_animation != 'existing' %}{{ section.settings.entrance_animation }}{% endif %}"
```

## Files to modify

For each file, read it first, then add schema block + data-aos:

### 1. `sections/blog-template.liquid`
- Outer wrapper: `<div data-section-id="{{ section.id }}" data-section-type="blog">`
- Add `data-aos` to that div

### 2. `sections/article-template.liquid`
- Has hero image section, then main content
- Find the main content div after the hero section closes — look for `<div class="page-width page-content">` or similar
- Add data-aos to the main content wrapper

### 3. `sections/collection-header.liquid`
- Wrapper: `<div id="CollectionHeaderSection" ...>`
- Add data-aos to that div

### 4. `sections/collection-return.liquid`
- Wrapper: `<div class="text-center page-content page-content--bottom">`
- Add data-aos there

### 5. `sections/list-collections-template.liquid`
- Starts with `{%- liquid %}` blocks
- Find the outermost content wrapper div and add data-aos there

### 6. `sections/contact-form.liquid`
- Wrapper: `<div class="index-section">`
- Add data-aos there

### 7. `sections/faq.liquid`
- Has `section--divider` conditional wrapper
- Inner wrapper: `<div class="page-width page-width--narrow">`
- Add data-aos there

## Do NOT modify
- Any file outside `sections/`
- `assets/`, `config/`, `layout/`, `locales/`

## Verification
After each file, verify:
```bash
Select-String -LiteralPath "sections/FILE.liquid" -Pattern "entrance_animation"
```

## Report
Write results to `.superpowers/sdd/task-2-report.md` with status, commits, verification summary, and concerns. Then commit with message:
`feat(phase4): Task 2 - wire entrance_animation to 7 content/blog sections`
