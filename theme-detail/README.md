# Phantom Core Framework v1.5.0

A **decoupled WordPress framework** that replaces traditional PHP template hierarchy with a static HTML SPA architecture. Dynamic data is injected client-side via a custom REST API. The frontend is **100% replaceable** without touching PHP.

## Quick Stats

| Metric | Value |
|--------|-------|
| Version | **1.5.0** |
| Plugin | `phantom-core` (acts as both plugin + theme framework) |
| WordPress Theme Dir | **None** — no `wp-content/themes/` exists |
| Settings | **555** across 44 sections |
| REST API Endpoints | **34** under `phantom/v1` |
| Customizer Panels | **15** panels, **44** sections |
| Custom Controls | **13** |
| PHP Files | **38** (12,506 lines) |
| HTML Templates | **31** (static, replaceable) |
| Frontend JS | **24** files (7,815 lines incl. vendor) |
| PHPUnit Tests | **23** (4,464 assertions) |
| WooCommerce | Full integration via Store API + `wc-ajax` |
| Backend Health | **100/100** |

## Architecture Overview

```
WordPress Core ─── WooCommerce ─── Customizer
      │                  │              │
      └──────────────────┴──────────────┘
                     │
             Phantom Core Plugin
        ┌───────────┼───────────┐
        │           │           │
   Settings     REST API    Customizer
   Registry     34 routes   15 panels
   555 sets     phantom/v1  44 sections
        │           │           │
        └───────────┼───────────┘
                    │
            Shell SPA Router
         (template_redirect)
                    │
        ┌───────────┴───────────┐
        │                       │
   31 Static HTML           phantom-data.js
   Templates                (REST API bridge)
        │                       │
        └───────────┬───────────┘
                    │
            Browser SPA (Swup.js)
         Page transitions via AJAX
```

## How It Works

**Server-side (PHP):**
1. `template_redirect` at priority 0 intercepts all frontend requests
2. Shell maps URL → HTML template (e.g., `/shop` → `frontend/shop.html`)
3. Injects 90 CSS custom properties as `<style id="phantom-customizer-css">`
4. Injects SEO meta tags, security headers, `phantomData` JS config
5. Serves HTML + `exit` (WordPress never renders a theme)

**Client-side (JS):**
1. `phantom-data.js` loads on DOMContentLoaded
2. Fetches `/wp-json/phantom/v1/page-data` (mega-endpoint, 1hr cached)
3. Finds `[data-phantom="key"]` attributes in HTML → injects values
4. Finds `[data-phantom-menu]`, `[data-phantom-products]`, etc. → builds menus/products
5. Binds WooCommerce handlers (add-to-cart, quantity, checkout)
6. Subsequent navigation via Swup.js — fetches new page, replaces `#swup` content

## Documentation Files

| File | Contents |
|------|----------|
| `ARCHITECTURE.md` | Complete system architecture, data flow, component relationships, init order |
| `FEATURES.md` | Full feature inventory — 555 settings, 15 panels, 90 CSS vars, WooCommerce, SEO, performance |
| `CUSTOMIZATION.md` | 3-way customization guide — Customizer (visual) + Admin (form) + REST API (programmatic) |
| `FORENSIC-AUDIT.md` | Full backend audit — 19 bugs fixed, 5-agent forensic report, health scores |
| `FRONTEND-GUIDE.md` | Complete frontend development guide — data binding, attributes, WooCommerce integration |
| `FRONTEND-REPLACE-GUIDE.md` | Step-by-step guide for replacing the entire frontend with React/Vue/Next.js/static HTML |

## Three Ways to Customize

| Method | URL | Best For |
|--------|-----|----------|
| WordPress Customizer | `/wp-admin/customize.php` | Visual live preview (colors, fonts, layout) |
| Admin Settings Page | `/wp-admin/themes.php?page=phantom-core-settings` | Full CRUD with all 555 settings |
| REST API | `/wp-json/phantom/v1` | Programmatic control, integrations |

## Quick Start

```bash
# Settings managed via:
# - Customizer:  /wp-admin/customize.php        (visual)
# - Admin:       /wp-admin/themes.php?page=phantom-core-settings  (full CRUD)
# - REST API:    /wp-json/phantom/v1            (programmatic)

# Push local changes to Docker:
docker cp phantom-core wordpress:/var/www/html/wp-content/plugins/phantom-core

# Pull from Docker:
docker cp wordpress:/var/www/html/wp-content/plugins/phantom-core ./phantom-core
```

## Requirements

- WordPress 6.4+
- PHP 8.1+
- WooCommerce 8.0+ (optional, for shop features)
- MySQL 8.0 (recommended)

## GitHub

- **Repo:** `github.com/HAmmadsiamil007/PHANTOM-CORE`
- **Branch:** `master` (primary)
- **Frontend:** Any framework — backend stays as-is. See `FRONTEND-REPLACE-GUIDE.md`

## Backend Health (Post-Audit)

| Domain | Score | Status |
|--------|-------|--------|
| Code Quality | 100/100 | 19 bugs fixed, dead code removed, proper typing |
| Security | 100/100 | Nonce, sanitization, escaping, capabilities all verified |
| Performance | 100/100 | Options-based storage, CSS caching, no slow operations |
| Tests | 100/100 | 23 tests, 4,464 assertions, PHP 8.2 ready |
| **Aggregate** | **100/100** | Production-ready for any frontend |
