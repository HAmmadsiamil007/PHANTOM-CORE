# Typography Customizer Overhaul — Design Spec

## Scope: Essential

Full Google Fonts catalog, per-heading individual settings, system font stacks, responsive sizes, proper Customizer UI organization.

## Architecture

### Files Touched

| File | Change |
|------|--------|
| `includes/class-phantom-font-families.php` | Expand Google Fonts from ~20 to ~200 popular fonts |
| `includes/class-settings-registry.php` | Add per-heading settings, restructure `section_typography()` |
| `includes/class-customizer.php` | Update panel/section labels for new organization |
| `includes/custom-css/typography.php` | Generate CSS for new per-heading properties |
| `templates/shell.php` | Update Google Fonts injection to collect all heading fonts |
| `phantom-core.php` | Update `phantom_enqueue_google_fonts()` for multi-font enqueuing |
| `frontend/assets/css/*.css` | Frontend CSS uses existing CSS vars — minimal/no changes |

### Google Fonts

Replace hardcoded 20-font list with ~200 popular Google Fonts organized alphabetically. Use the existing `apply_filters( 'phantom_google_fonts', ... )` hook for extensibility.

The font loader URL (`get_font_enqueue_url`) already accepts any font name — the expansion is purely in the selectable dropdown list.

**Font categories included**: Sans-serif (Inter, Roboto, Open Sans, etc.), Serif (Playfair Display, Merriweather, Lora, etc.), Display (Oswald, Bebas Neue, etc.), Handwriting (Caveat, Pacifico, etc.), Monospace (Fira Code, JetBrains Mono, etc.)

### Settings Registry: Per-Heading Settings

Each heading level H1-H6 gets 5 new settings (in addition to existing `typography_hX_size` and `typography_hX_height`):

| Setting Key | Type | Default | Sanitize | CSS Var |
|---|---|---|---|---|
| `typography_h1_font` | select | '' | sanitize_text_field | `--h1-font` |
| `typography_h1_weight` | select | '' | sanitize_text_field | `--h1-weight` |
| `typography_h1_style` | select | 'normal' | sanitize_text_field | `--h1-style` |
| `typography_h1_spacing` | float | 0 | floatval | `--h1-spacing` |
| `typography_h1_case` | select | 'none' | sanitize_text_field | `--h1-case` |

Pattern repeats for H2-H6. Empty string means "inherit from heading default".

**New body setting**: `typography_body_style` (select, normal/italic, default 'normal').

**Existing shared heading settings** (`typography_heading_font`, `typography_heading_weight`, `typography_heading_case`, `typography_heading_spacing`) remain as fallback defaults.

### CSS Generation Logic

In `includes/custom-css/typography.php`, for each heading level:

```php
$headings = ['h1','h2','h3','h4','h5','h6'];
foreach ($headings as $h) {
    $prefix = 'typography_' . $h . '_';
    // Font family: per-heading > heading_default > body_font
    $font = get_option('phantom_' . $prefix . 'font', '');
    if ('' === $font) $font = get_option('phantom_typography_heading_font', '');
    if ('' === $font) $font = get_option('phantom_typography_body_font', 'Archivo');
    // Similar cascade for weight
    $weight = get_option('phantom_' . $prefix . 'weight', '');
    if ('' === $weight) $weight = get_option('phantom_typography_heading_weight', '500');
    // etc.
}
```

CSS vars are output on `:root` with the existing pattern.

### Google Font Enqueuing

`phantom_enqueue_google_fonts()` in `phantom-core.php` collects ALL unique font names across body + all heading levels. Passes them all to `get_font_enqueue_url()`.

### Customizer UI

```
Typography & Fonts (panel, priority 80)
  └── Typography (section)
        ── BODY TYPOGRAPHY ── (divider)
        Font Family, Weight, Style, Size (resp), Line Height, Letter Spacing
        ── HEADING DEFAULTS ── (divider)
        Default Font Family, Default Weight, Default Text Case
        ── H1 ── (divider)
        Font Family, Weight, Style, Size (resp), Height, Spacing, Case
        ── H2 ── (divider) ... same
        ── H3 ── (divider) ... same
        ── H4 ── (divider) ... same
        ── H5 ── (divider) ... same
        ── H6 ── (divider) ... same
        ── FONT SUBSETS ── (divider)
        Font Subsets (multi-select)
```

### Frontend Connection

- **Shell.php**: `inject_google_fonts()` collects all selected fonts. `inject_customizer_css()` outputs new CSS vars automatically.
- **Customizer live preview**: `customizer-preview.js` handles CSS var updates via `PhantomCustomizer.cssVarMap`. New keys added to `get_css_var_map()` and `get_px_keys()` work automatically.
- **phantom-bridge.js**: All settings passed as `phantomData.*` — no changes needed.
- **Frontend CSS**: Uses `var(--h1-font)`, `var(--h1-weight)`, `var(--font-body-style)`, etc. — already wired.

### Backward Compatibility

- Shared heading settings (`typography_heading_font`, `typography_heading_weight`, `typography_heading_case`, `typography_heading_spacing`) remain as fallbacks
- All existing CSS vars preserved — new vars are additive
- No existing settings removed
- No frontend HTML template changes needed
