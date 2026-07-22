# Phantom Core Framework — Agent Instructions

## Project State
- **Version**: 1.5.3
- **Plugin**: `phantom-core` — decoupled WordPress framework with static HTML SPA architecture
- **Settings**: 555 across 44 sections
- **Customizer**: 15 panels, 25+ sections, 13 custom control types
- **REST API**: 34 endpoints under `phantom/v1`
- **HTML Templates**: 31 static templates in `frontend/`
- **JS Files**: 22 frontend + 11 customizer control files
- **CSS Modules**: 8 modular CSS generation files
- **WooCommerce**: Full integration with Store API, template overrides
- **Docker**: WordPress on port 8080, MySQL 8.0 on port 3307
- **Latest audit**: Deep forensic audit — 6 layers verified with 100/100 health across all layers. 19 issues found (5 critical, 8 medium, 6 low). All 5 critical + 6 medium fixed.

## Architecture
```
WordPress ─── WooCommerce
     │
Phantom Core Plugin
  ├── Settings Registry (555 settings)
  ├── Customizer (15 panels, 13 custom controls)
  ├── Admin Settings Page (tabbed UI)
  ├── REST API (phantom/v1 — 34 endpoints)
  ├── CSS Generation Engine (8 modules)
  ├── Global Color Palette (4 presets, dark mode)
  ├── Font System (Google + system + local)
  └── Shell SPA Router (template_redirect → HTML)
       │
  Frontend (swappable)
  ├── 31 static HTML templates
  ├── PhantomBridge.js (REST API bridge)
  └── phantom-data.js (data injection)
```

## Key Files
| File | Purpose |
|------|---------|
| `phantom-core.php` | Plugin bootstrap, autoloader, constants |
| `includes/class-settings-registry.php` | 555 settings, 44 sections |
| `includes/class-customizer.php` | Customizer integration |
| `includes/class-rest-controller.php` | REST API (34 endpoints) |
| `includes/class-custom-css.php` | CSS Generation Engine |
| `includes/class-phantom-global-palette.php` | 9-color palette system |
| `includes/class-phantom-font-families.php` | System + Google Fonts |
| `includes/class-phantom-webfont-loader.php` | Local font enqueue |
| `includes/custom-controls/` | 13 custom Customizer controls |
| `includes/custom-css/` | 8 CSS module files |
| `admin/js/customizer-preview.js` | Live preview bindings |
| `admin/js/customizer-conditionals.js` | Conditional display logic |
| `frontend/assets/js/phantom-bridge.js` | REST API bridge |
| `templates/shell.php` | SPA Router |

## Known Issues
1. MySQL auth requires db_data volume reset on password change
2. REST API loopback fails in Docker (expected — no loopback interface)
3. `load_plugin_textdomain` called too early — should be on `init` hook
4. 7 frontend JS files use `$` instead of `jQuery` (fixed with wrapper — still need to update HTML template script tags to reference originals)

## Development Workflow
```bash
# Push local changes to Docker
docker cp phantom-core phantom_wordpress:/var/www/html/wp-content/plugins/phantom-core

# Pull from Docker
docker cp phantom_wordpress:/var/www/html/wp-content/plugins/phantom-core ./phantom-core
```
