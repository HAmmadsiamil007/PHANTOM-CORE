# Phantom Core — Customization Guide

## Total User-Accessible Controls

| System | Controls | How to Access |
|--------|----------|---------------|
| WordPress Core | 100+ | WP native (Users, Posts, Pages, Media, etc.) |
| WooCommerce | 250+ | WC native admin |
| Phantom Theme Settings | **555 settings** | Customizer + Admin Page + REST API |
| Customizer Panels | 15 panels, 44 sections | `/wp-admin/customize.php` |
| Admin Page Tabs | 15 tabs | `/wp-admin/themes.php?page=phantom-core-settings` |
| CSS Custom Properties | 90 design tokens | Injected as `<style id="phantom-customizer-css">` |
| REST Endpoints | 34 routes | `/wp-json/phantom/v1` |
| **Total Controls** | **~900+** | Three independent access paths |

---

## Three Ways to Customize (All Connected)

### Method 1: WordPress Customizer (Visual)
**URL:** `/wp-admin/customize.php`

15 Panels with 44 sections. Best for visual editing with live preview.

**Live preview works for:**
- ✅ All `color` type settings → instant update via `postMessage`
- ✅ 7 hero settings → explicit `postMessage` binding
- ✅ ~42 CSS var changes update instantly (via color transport)
- ❌ Everything else → requires page refresh

**How it works:**
```
Customizer saves
    │
    ▼
update_option('phantom_primary_color', '#ff0000')
    │
    ▼
Shell reads option on next page load → injects as CSS var → frontend updates
```

**Customizer Live Preview JS:**
`admin/js/customizer-preview.js` — auto-binds CSS vars + DOM-specific changes. Runs in the Customizer iframe.

**Customizer Conditionals:**
`admin/js/customizer-conditionals.js` — hide/show controls based on other control values.

---

### Method 2: Admin Settings Page (Form)
**URL:** `/wp-admin/themes.php?page=phantom-core-settings`

Full CRUD with 15 tabs covering every setting. All field types:

- Text, textarea, number, checkbox, select, multiselect
- Color picker, image upload, code editor (CSS/JS/HTML/JSON)
- Repeater fields with sub-fields (bool, select, color, text, image)
- Dependency/conditional logic
- Import/Export buttons

**Security:** Nonce verification + `manage_options` capability check.

---

### Method 3: REST API (Programmatic)
**Base URL:** `/wp-json/phantom/v1`

**Auth:** `manage_options` capability for write operations.

```bash
# Get all settings
GET /wp-json/phantom/v1/settings

# Get settings by section
GET /wp-json/phantom/v1/settings?section=colors

# Update a single setting
PUT /wp-json/phantom/v1/settings/primary_color
{ "value": "#ff0000" }

# Bulk update settings
POST /wp-json/phantom/v1/settings
{ "settings": { "primary_color": "#ff0000", "header_sticky": true } }

# Get setting schema (types, defaults, options)
GET /wp-json/phantom/v1/schema

# Export all settings as JSON
POST /wp-json/phantom/v1/export

# Import settings from JSON
POST /wp-json/phantom/v1/import
{ "data": { "primary_color": "#ff0000", ... } }

# Flush cache
POST /wp-json/phantom/v1/cache/flush
```

---

## CSS Variable Architecture

The bridge between backend settings and frontend styling.

### How Customization Reaches the Frontend

**1. PHP Path (initial page load):**
```
User sets "primary_color" → update_option('phantom_primary_color', '#ff0000')
        │
        ▼
Shell::inject_customizer_css() reads ALL phantom_options from DB
        │
        ▼
Builds :root { --primary--color: #ff0000; --secondary--color: #...; ... }
        │
        ▼
Injected as <style id="phantom-customizer-css"> in <head>
```

**2. JS Path (Customizer live preview):**
```
User changes "primary_color" in Customizer
        │
        ▼
wp.customize('phantom_primary_color', (val) => {
    document.documentElement.style.setProperty('--primary--color', val);
});
        │
        ▼
All elements using var(--primary--color) update instantly
```

**3. JS Path (frontend data injection):**
```
phantom-data.js fetches /wp-json/phantom/v1/page-data
        │
        ▼
injectSettings() finds [data-phantom="site_title"]
        │
        ▼
Sets textContent / src / href from API response
```

### CSS Var Naming Convention

Settings keys convert `_` to `--`:
```
primary_color      → --primary--color
header_bg          → --header--bg
body_font_size     → --body--font--size
container_width    → --container--width
button_radius      → --button--radius
```

### Complete 90 CSS Variable Map

| Group | Count | Vars |
|-------|-------|------|
| Container | 3 | `--container--width`, `--content--width`, `--sidebar--width` |
| General | 9 | `--layout--columns`, `--boxed--width`, `--gap`, `--column--gap`, `--row--gap`, `--section--pad--y`, `--section--pad--x`, `--container--gutter`, `--field--outline` |
| Typography | 17 | `--font--body`, `--font--body--weight`, `--font--heading`, `--font--heading--weight`, `--base--font--size`, `--body--line--height`, `--letter--spacing`, `--text--case`, `--typography--h1--size`...`--typography--h6--size`, `--typography--h1--height`...`--typography--h6--height` |
| Colors | 12 | `--primary--color`, `--secondary--color`, `--accent--color`, `--text--color`, `--heading--color`, `--bg--color`, `--link--color`, `--link--hover--color`, `--border--color`, `--sale--color`, `--info--color`, `--featured--badge--color` |
| Gradients | 2 | `--gradient--start--color`, `--gradient--end--color` |
| Header | 10 | `--header--bg`, `--header--text`, `--header--padding`, `--header--padding--x`, `--header--padding--y`, `--header--fullwidth`, `--sticky--header`, `--header--height`, `--header--mobile--height`, `--header--border--width` |
| Navigation | 4 | `--menu--font--size`, `--menu--font--weight`, `--nav--menu--height`, `--nav--submenu--width` |
| Hero | 5 | `--hero--height`, `--hero--overlay--color`, `--hero--overlay--opacity`, `--hero--bg`, `--hero--text` |
| Footer | 5 | `--footer--bg`, `--footer--text`, `--footer--padding`, `--footer--fullwidth`, `--footer--heading` |
| Buttons | 8 | `--btn--bg`, `--btn--text`, `--btn--hover--bg`, `--btn--hover--text`, `--border--radius`, `--btn--pad--y`, `--btn--pad--x`, `--btn--font--size` |
| Forms | 2 | `--input--radius`, `--input--height` |
| Announcement | 3 | `--announcement--bg`, `--announcement--text--color`, `--announcement--enable` |
| Product | 5 | `--product--card--bg`, `--product--sale--badge--bg`, `--product--featured--badge--bg`, `--product--image--radius`, `--product--card--gap` |
| Preloader | 3 | `--preloader--bg`, `--preloader--color`, `--preloader--enable` |
| Misc | 3 | `--custom--css`, `--woo--button--bg`, `--woo--button--text` |

### 43 Numeric PX Keys
These get `px` appended automatically:
```
button-padding-x, button-padding-y, button-radius,
header-padding-x, header-padding-y, header-border-width,
header-mobile-height, header-height, container-width, content-width,
sidebar-width, breakpoint-xl, breakpoint-lg, breakpoint-md, breakpoint-sm,
section-padding-x, section-padding-y, menu-font-size, button-font-size,
widget-spacing, container-gutter, content-gap, element-margin-bottom,
home-section-spacing, typography-base-size, typography-body-spacing,
typography-heading-spacing, typography-h1-size, typography-h1-height,
typography-h2-size, typography-h2-height, typography-h3-size,
typography-h3-height, typography-h4-size, typography-h4-height,
typography-h5-size, typography-h5-height, typography-h6-size,
typography-h6-height, form-input-height, layout-columns,
nav-menu-height, nav-submenu-width
```

### ⚠️ CSS Var Map Duplication

The CSS var maps and px key lists are centralized in one file:

| File | Method | What's Defined |
|------|--------|----------------|
| `includes/class-settings-registry.php` | `get_css_var_map()` (~line 208) | 90 var-to-setting mappings |
| `includes/class-settings-registry.php` | `get_px_keys()` (~line 309) | 43 px keys |
| `includes/class-customizer.php` | `get_css_var_map()` | 90 var mappings (duplicate from registry) |
| `includes/class-custom-css.php` | CSS generation | Consumes the registry's var maps |

**If adding a CSS var, add to `class-settings-registry.php` first**, then sync `class-customizer.php`. The custom-css engine automatically picks up registry changes.

---

## Adding New Features

### New Settings
```
1. Add entry in Settings_Registry::define_entries()
   - Set key, type, default, sanitize callback
   - Optionally set css_property, css_selector for CSS var
2. Setting automatically appears in:
   - Customizer (as control)
   - Admin Page (as form field)
   - REST API (as /settings/{key})
3. Add data-phantom="your_key" to HTML template
4. If CSS var: add to get_css_var_map() in BOTH customizer.php AND shell.php
5. If numeric: add to get_px_keys() in BOTH files
```

### New Page Template
```
1. Create frontend/your-page.html
2. Add route in Shell::$routes array
3. Add SEO title/description in Shell::get_meta_tags()
4. Add data-phantom attributes for dynamic content
5. Add page settings section in Settings_Registry if needed
```

### New REST Endpoint
```
1. Add method to Rest_Controller class
2. Register route in register_routes()
3. Set permission_callback (admin vs public)
4. Sanitize inputs, escape outputs
5. Add frontend JS consumer in phantom-data.js
```

---

## Complete Data Attribute Reference

### Settings Injection (`injectSettings`)
- `data-phantom="key"` — Any element: sets textContent (default), src (img/source), href (a)
- `data-phantom-bg="key"` — Block elements: sets CSS background-image
- `data-phantom-alt="key"` — `<img>` alt text

### Menu Injection (`injectMenus`)
- `data-phantom-menu="primary"` — Primary navigation
- `data-phantom-menu="secondary"` — Secondary nav
- `data-phantom-menu="footer"` — Footer menu
- `data-phantom-menu="mobile"` — Mobile menu
- `data-phantom-menu="categories"` — Category menu

### Product Injection (`injectProducts`)
- `data-phantom-products="featured"` — Featured products
- `data-phantom-products="all"` — All products
- `data-phantom-products="related"` — Related (needs `data-id`)
- `data-phantom-products="category"` — By category (needs `data-category`)
- Optional: `data-count="N"`, `data-id="ID"`, `data-category="slug"`

### Post Injection (`injectPosts`)
- `data-phantom-posts="recent"` — Recent posts
- `data-phantom-posts="related"` — Related (needs `data-id`)
- `data-phantom-posts="category"` — By category (needs `data-category`)

### CSS Class Names Used by phantom-data.js
- `.cart-count`, `.cart-total` — Cart badge/price
- `.add-to-cart-trigger`, `.primary_btn` — Add to cart buttons
- `.decrease-button`, `.increase-button` — Quantity controls
- `.remove-product` — Remove from cart
- `#contactpage` — Checkout form
- `.shopping-cart-info` — Cart dropdown
- `.loader-mask`, `#preloader`, `.preloader` — Loading screen
- `.search-suggestions`, `.search-dropdown` — Live search
- `.mobile-menu-toggle`, `.nav-menu` — Mobile menu
- `.notification-popup` — Toast messages
- `.cart-drawer`, `.cart-overlay` — Side cart
- `.related-products-grid`, `.related-products-slider` — Related products
