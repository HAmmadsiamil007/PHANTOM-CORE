# Typography Customizer Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Customizer typography controls — expand Google Fonts to ~200, add per-heading font/weight/style/spacing/case, add body font style, proper CSS inheritance chain.

**Architecture:** Individual settings pattern (one setting per property). Per-heading empty values inherit from heading defaults, which inherit from body settings. Settings → CSS vars → CSS generation → frontend.

**Tech Stack:** WordPress Customizer API, PHP 7.4+, Google Fonts CSS2 API

## Global Constraints

- No frontend HTML template changes
- All existing settings preserved (backward compat)
- New settings use existing `phantom_` option prefix pattern
- CSS var map + px_keys must stay in sync with settings
- Font family select choices must include both system + Google Fonts
- Empty string per-heading value = inherit from heading default

---

### Task 1: Expand Google Fonts Catalog

**Files:**
- Modify: `includes/class-phantom-font-families.php:36-51`

**Interfaces:**
- Consumes: No changes — `get_google_fonts()` returns `array<string, array<int>>`
- Produces: Expanded font list (200 fonts instead of 20)

- [ ] **Read the current file**

- [ ] **Replace `get_google_fonts()` with expanded list**

Replace the return statement in `get_google_fonts()` with ~200 fonts including all major Google Fonts categories:

```php
return apply_filters('phantom_google_fonts', array(
    // Sans-Serif
    'Inter' => array(100,200,300,400,500,600,700,800,900),
    'Roboto' => array(100,300,400,500,700,900),
    'Open Sans' => array(300,400,500,600,700,800),
    'Lato' => array(100,300,400,700,900),
    'Montserrat' => array(100,200,300,400,500,600,700,800,900),
    'Poppins' => array(100,200,300,400,500,600,700,800,900),
    'Nunito' => array(200,300,400,600,700,800,900),
    'Nunito Sans' => array(200,300,400,600,700,800,900),
    'Raleway' => array(100,200,300,400,500,600,700,800,900),
    'Work Sans' => array(100,200,300,400,500,600,700,800,900),
    'DM Sans' => array(400,500,700),
    'Plus Jakarta Sans' => array(200,300,400,500,600,700,800),
    'Figtree' => array(300,400,500,600,700,800,900),
    'Source Sans 3' => array(200,300,400,500,600,700,800,900),
    'Noto Sans' => array(100,200,300,400,500,600,700,800,900),
    'Ubuntu' => array(300,400,500,700),
    'Oswald' => array(200,300,400,500,600,700),
    'Karla' => array(200,300,400,500,600,700,800),
    'Manrope' => array(200,300,400,500,600,700,800),
    'Epilogue' => array(100,200,300,400,500,600,700,800,900),
    'Be Vietnam Pro' => array(100,200,300,400,500,600,700,800,900),
    'Lexend' => array(100,200,300,400,500,600,700,800,900),
    'Space Grotesk' => array(300,400,500,600,700),
    'Public Sans' => array(100,200,300,400,500,600,700,800,900),
    'Sora' => array(100,200,300,400,500,600,700,800),
    'Jost' => array(100,200,300,400,500,600,700,800,900),
    'Rubik' => array(300,400,500,600,700,800,900),
    'Archivo' => array(100,200,300,400,500,600,700,800,900),
    'Barlow' => array(100,200,300,400,500,600,700,800,900),
    'Barlow Condensed' => array(100,200,300,400,500,600,700,800,900),
    'Fira Sans' => array(100,200,300,400,500,600,700,800,900),
    'Hanken Grotesk' => array(100,200,300,400,500,600,700,800,900),
    'IBM Plex Sans' => array(100,200,300,400,500,600,700),
    'Outfit' => array(100,200,300,400,500,600,700,800,900),
    'Syne' => array(400,500,600,700,800),
    'Chivo' => array(100,200,300,400,500,600,700,800,900),
    'Kanit' => array(100,200,300,400,500,600,700,800,900),
    'Mukta' => array(200,300,400,500,600,700,800),
    'Rajdhani' => array(300,400,500,600,700),
    'Titillium Web' => array(200,300,400,600,700,900),
    'Cabin' => array(400,500,600,700),
    'Heebo' => array(100,200,300,400,500,600,700,800,900),
    'Assistant' => array(200,300,400,500,600,700,800),
    'Secular One' => array(400),
    'Alegreya Sans' => array(100,300,400,500,700,800,900),
    'Encode Sans' => array(100,200,300,400,500,600,700,800,900),
    'Exo 2' => array(100,200,300,400,500,600,700,800,900),
    'Abel' => array(400),
    'Prompt' => array(100,200,300,400,500,600,700,800,900),
    'Maven Pro' => array(400,500,600,700,800,900),
    'Asap' => array(100,200,300,400,500,600,700,800,900),
    'Quicksand' => array(300,400,500,600,700),
    'Days One' => array(400),
    'Pathway Gothic One' => array(400),
    'Francois One' => array(400),
    'Bebas Neue' => array(400),
    'Anton' => array(400),
    'Abril Fatface' => array(400),
    'Alfa Slab One' => array(400),
    'Righteous' => array(400),
    'Arimo' => array(400,500,600,700),
    'Catamaran' => array(100,200,300,400,500,600,700,800,900),
    'M PLUS Rounded 1c' => array(100,300,400,500,700,800,900),
    'Didact Gothic' => array(400),
    'Gothic A1' => array(100,200,300,400,500,600,700,800,900),
    'Nanum Gothic' => array(400,700,800),
    'Noto Sans KR' => array(100,200,300,400,500,600,700,800,900),
    'Noto Sans JP' => array(100,200,300,400,500,600,700,800,900),
    'Noto Sans SC' => array(100,200,300,400,500,600,700,800,900),
    'Zen Kaku Gothic New' => array(300,400,500,700,900),
    'Zen Maru Gothic' => array(300,400,500,700,900),
    // Serif
    'Playfair Display' => array(400,500,600,700,800,900),
    'Merriweather' => array(300,400,700,900),
    'Lora' => array(400,500,600,700),
    'EB Garamond' => array(400,500,600,700,800),
    'Cormorant Garamond' => array(300,400,500,600,700),
    'PT Serif' => array(400,700),
    'Noto Serif' => array(100,200,300,400,500,600,700,800,900),
    'Source Serif 4' => array(200,300,400,500,600,700,800,900),
    'Bitter' => array(100,200,300,400,500,600,700,800,900),
    'Libre Baskerville' => array(400,700),
    'Crimson Pro' => array(200,300,400,500,600,700,800,900),
    'Crimson Text' => array(400,600,700),
    'Cardo' => array(400,700),
    'DM Serif Display' => array(400),
    'DM Serif Text' => array(400),
    'Alegreya' => array(400,500,600,700,800,900),
    'Fraunces' => array(100,200,300,400,500,600,700,800,900),
    'Domine' => array(400,500,600,700),
    'Taviraj' => array(100,200,300,400,500,600,700,800,900),
    'Literata' => array(200,300,400,500,600,700,800,900),
    'Spectral' => array(200,300,400,500,600,700,800),
    'Old Standard TT' => array(400,700),
    'Prompt' => array(100,200,300,400,500,600,700,800,900),
    'Zilla Slab' => array(300,400,500,600,700),
    'Slabo 27px' => array(400),
    'Vollkorn' => array(400,500,600,700,800,900),
    'Faustina' => array(300,400,500,600,700,800),
    'Newsreader' => array(200,300,400,500,600,700,800),
    'Martel' => array(200,300,400,600,700,800,900),
    'Frank Ruhl Libre' => array(300,400,500,700,900),
    'STIX Two Text' => array(400,500,600,700),
    'Scope One' => array(400),
    'Prata' => array(400),
    'Bodoni Moda' => array(400,500,600,700,800,900),
    'Marcellus' => array(400),
    'Marcellus SC' => array(400),
    'Cinzel' => array(400,500,600,700,800,900),
    'Cinzel Decorative' => array(400,700,900),
    'Sorts Mill Goudy' => array(400),
    'Sree Krushnadevaraya' => array(400),
    'Sura' => array(400,700),
    'Petrona' => array(100,200,300,400,500,600,700,800,900),
    'Sunflower' => array(300,500,700),
    'Yrsa' => array(300,400,500,600,700),
    'Trirong' => array(100,200,300,400,500,600,700,800,900),
    'Halant' => array(300,400,500,600,700),
    'Stoke' => array(300,400),
    'Karma' => array(300,400,500,600,700),
    'Rasa' => array(300,400,500,600,700),
    'Fjord One' => array(400),
    'Mate' => array(400),
    'Mate SC' => array(400),
    'Quintessential' => array(400),
    'Rufina' => array(400,700),
    'Crete Round' => array(400),
    'Poly' => array(400),
    'Arvo' => array(400,700),
    'Trocchi' => array(400),
    'Judson' => array(400,700),
    'Neuton' => array(200,300,400,700,800),
    'Adamina' => array(400),
    'Rationale' => array(400),
    // Display / Decorative
    'Lobster' => array(400),
    'Lobster Two' => array(400,700),
    'Pacifico' => array(400),
    'Caveat' => array(400,500,600,700),
    'Dancing Script' => array(400,500,600,700),
    'Great Vibes' => array(400),
    'Satisfy' => array(400),
    'Cookie' => array(400),
    'Alex Brush' => array(400),
    'Parisienne' => array(400),
    'Tangerine' => array(400,700),
    'Orbitron' => array(400,500,600,700,800,900),
    'Press Start 2P' => array(400),
    'Bangers' => array(400),
    'Fredoka One' => array(400),
    'Fredoka' => array(300,400,500,600,700),
    'Teko' => array(300,400,500,600,700),
    'Yanone Kaffeesatz' => array(200,300,400,500,600,700),
    'Bowlby One SC' => array(400),
    'Luckiest Guy' => array(400),
    'Chewy' => array(400),
    'Permanent Marker' => array(400),
    'Kaushan Script' => array(400),
    'Amaranth' => array(400,700),
    'Concert One' => array(400),
    'Passion One' => array(400,700,900),
    'Fugaz One' => array(400),
    'Sigmar One' => array(400),
    'Patua One' => array(400),
    'Titan One' => array(400),
    'Modak' => array(400),
    'Bubblegum Sans' => array(400),
    'Knewave' => array(400),
    'Monoton' => array(400),
    'Unica One' => array(400),
    'Rampart One' => array(400),
    'Train One' => array(400),
    'Yusei Magic' => array(400),
    'Kiwi Maru' => array(300,400,500),
    'Stick' => array(400),
    'RocknRoll One' => array(400),
    'Reggae One' => array(400),
    'Noto Sans Japanese' => array(100,300,400,500,700,900),
    'Mochiy Pop P One' => array(400),
    'Mochiy Pop P' => array(400),
    'Hina Mincho' => array(400),
    'Sawarabi Mincho' => array(400),
    'Sawarabi Gothic' => array(400),
    // Handwriting
    'Indie Flower' => array(400),
    'Short Stack' => array(400),
    'Cedarville Cursive' => array(400),
    'Homemade Apple' => array(400),
    'Covered By Your Grace' => array(400),
    'Gloria Hallelujah' => array(400),
    'Patrick Hand' => array(400),
    'Architects Daughter' => array(400),
    'Gochi Hand' => array(400),
    'Reenie Beanie' => array(400),
    'Handlee' => array(400),
    'Shadows Into Light' => array(400),
    'Shadows Into Light Two' => array(400),
    'Rock Salt' => array(400),
    'Just Another Hand' => array(400),
    'Coming Soon' => array(400),
    'Bad Script' => array(400),
    'Marck Script' => array(400),
    'Neucha' => array(400),
    'Pangolin' => array(400),
    // Monospace
    'JetBrains Mono' => array(100,200,300,400,500,600,700,800),
    'Fira Mono' => array(400,500,700),
    'Fira Code' => array(300,400,500,600,700),
    'Source Code Pro' => array(200,300,400,500,600,700,800,900),
    'Space Mono' => array(400,700),
    'IBM Plex Mono' => array(100,200,300,400,500,600,700),
    'Roboto Mono' => array(100,200,300,400,500,600,700),
    'Inconsolata' => array(200,300,400,500,600,700,800,900),
    'Cousine' => array(400,700),
    'Major Mono Display' => array(400),
    'Nanum Gothic Coding' => array(400,700),
    'Overpass Mono' => array(300,400,500,600,700),
    'PT Mono' => array(400),
    'Share Tech Mono' => array(400),
    'Syne Mono' => array(400),
    'Xanh Mono' => array(400),
    'DM Mono' => array(300,400,500),
    'Cutive Mono' => array(400),
    'Oxygen Mono' => array(400),
    'Ubuntu Mono' => array(400,700),
));
```

- [ ] **Verify syntax**

Run: `php -l includes/class-phantom-font-families.php`
Expected: `No syntax errors detected`

- [ ] **Commit**

```bash
git add includes/class-phantom-font-families.php
git commit -m "feat: expand Google Fonts catalog to ~200 fonts"
```

---

### Task 2: Add Per-Heading Typography Settings to Registry

**Files:**
- Modify: `includes/class-settings-registry.php` — section_typography(), get_css_var_map(), get_px_keys()

**Interfaces:**
- Consumes: Expanded font choices from Task 1
- Produces: New settings that Customizer, CSS generation, and font enqueuing consume

- [ ] **Read current section_typography()** at line 3063

- [ ] **Add body_style setting** inside section_typography()

After `typography_body_spacing`, insert:

```php
'typography_body_style' => array(
    'section' => 'typography',
    'type'    => 'select',
    'default' => 'normal',
    'choices' => array(
        'normal' => 'Normal',
        'italic' => 'Italic',
    ),
    'sanitize' => 'sanitize_text_field',
    'label'   => __( 'Body Font Style', 'phantom-core' ),
),
```

- [ ] **Add per-heading font settings** for H1-H6

After the `typography_headings` composite entry but before the return, add a helper loop. Since PHP doesn't allow calling helpers in array return, insert settings inline after the heading defaults.

For each h in [h1, h2, h3, h4, h5, h6], after the existing `typography_hX_height` entry, add 5 new entries:

```php
'typography_h1_font' => array(
    'section' => 'typography',
    'type'    => 'select',
    'default' => '',
    'choices' => $font_families, // system + google
    'sanitize' => 'sanitize_text_field',
    'label'   => __( 'H1 Font Family', 'phantom-core' ),
),
'typography_h1_weight' => array(
    'section' => 'typography',
    'type'    => 'select',
    'default' => '',
    'choices' => $weights,
    'sanitize' => 'sanitize_text_field',
    'label'   => __( 'H1 Font Weight', 'phantom-core' ),
),
'typography_h1_style' => array(
    'section' => 'typography',
    'type'    => 'select',
    'default' => 'normal',
    'choices' => array('normal' => 'Normal', 'italic' => 'Italic'),
    'sanitize' => 'sanitize_text_field',
    'label'   => __( 'H1 Font Style', 'phantom-core' ),
),
'typography_h1_spacing' => array(
    'section' => 'typography',
    'type'    => 'float',
    'default' => 0,
    'min'     => -5,
    'max'     => 20,
    'step'    => 0.5,
    'sanitize' => 'floatval',
    'label'   => __( 'H1 Letter Spacing (px)', 'phantom-core' ),
),
'typography_h1_case' => array(
    'section' => 'typography',
    'type'    => 'select',
    'default' => 'none',
    'choices' => $cases,
    'sanitize' => 'sanitize_text_field',
    'label'   => __( 'H1 Text Case', 'phantom-core' ),
),
```

Repeat for h2, h3, h4, h5, h6 with updated labels.

To avoid code duplication, at the top of the method define `$headings = ['h1','h2','h3','h4','h5','h6'];` and build the return array programmatically using a loop. The existing per-heading settings (size, height) should also use this loop.

```php
$sans_serif = array_merge(array('' => '— Inherit —'), $system_fonts, $google_fonts);
```
Wait — per-heading font defaults should be '' (inherit). The choices should be system + google fonts (same as body/heading). Let me refactor the method to use a loop.

- [ ] **Refactor section_typography() to use a loop** for H1-H6 settings

Extract the font list and choices at the top:
```php
$system_fonts = \Phantom_Font_Families::instance()->get_system_fonts();
$system_choices = array();
foreach ($system_fonts as $name => $stack) {
    $system_choices[$name] = $name;
}
$google_choices = array();
$google_fonts = \Phantom_Font_Families::instance()->get_google_fonts();
foreach ($google_fonts as $name => $weights) {
    $google_choices[$name] = $name;
}
$font_families = array('' => '— Inherit —') + $system_choices + $google_choices;
```

Then build per-heading settings in a loop.

- [ ] **Update get_css_var_map()** — add entries for new settings

Add to the css_var_map array:
```php
'typography_body_style'      => '--font-body-style',
'typography_h1_font'         => '--h1-font',
'typography_h1_weight'       => '--h1-weight',
'typography_h1_style'        => '--h1-style',
'typography_h1_spacing'      => '--h1-spacing',
'typography_h1_case'         => '--h1-case',
// ... h2 through h6
```

- [ ] **Update get_px_keys()** — add spacing keys

Add to px_keys:
```php
'typography_h1_spacing', 'typography_h2_spacing', 'typography_h3_spacing',
'typography_h4_spacing', 'typography_h5_spacing', 'typography_h6_spacing',
'typography_body_style', // not px but harmless in px_keys - it won't get px suffix because it's not numeric
```

Wait, `typography_body_style` shouldn't be in px_keys since it's 'normal' or 'italic'. Let me just add the heading spacing keys.

- [ ] **Verify syntax**

Run: `php -l includes/class-settings-registry.php`
Expected: `No syntax errors detected`

- [ ] **Commit**

```bash
git add includes/class-settings-registry.php
git commit -m "feat: add per-heading typography settings + body font style"
```

---

### Task 3: Update CSS Generation for Per-Heading Typography

**Files:**
- Modify: `includes/custom-css/typography.php`

- [ ] **Read the current file**

- [ ] **Add body font style output**

In the `$keys` array at line 17, add `'typography_body_style'`. In the foreach output section, add special handling for style property (no px suffix, just raw value).

- [ ] **Add per-heading font/style/weight/spacing/case CSS output**

After the existing H1-H6 size/height blocks, add a new section that outputs per-heading font, weight, style, spacing, case with inheritance fallback:

```php
$headings = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
foreach ($headings as $h) {
    $prefix = 'typography_' . $h . '_';
    
    // Font: per-heading > heading_default > body_font
    $font = get_option('phantom_' . $prefix . 'font', '');
    if ('' === $font) $font = get_option('phantom_typography_heading_font', '');
    if ('' === $font) $font = get_option('phantom_typography_body_font', 'Archivo');
    $output .= "\t" . '--' . $h . '-font: ' . esc_attr($font) . ";\n";
    
    // Weight: per-heading > heading_default > 400
    $weight = get_option('phantom_' . $prefix . 'weight', '');
    if ('' === $weight) $weight = get_option('phantom_typography_heading_weight', '500');
    $output .= "\t" . '--' . $h . '-weight: ' . esc_attr($weight) . ";\n";
    
    // Style
    $style = get_option('phantom_' . $prefix . 'style', 'normal');
    $output .= "\t" . '--' . $h . '-style: ' . esc_attr($style) . ";\n";
    
    // Spacing
    $spacing = get_option('phantom_' . $prefix . 'spacing', '');
    if ('' !== $spacing) {
        $output .= "\t" . '--' . $h . '-spacing: ' . esc_attr(floatval($spacing)) . "px;\n";
    }
    
    // Case
    $case = get_option('phantom_' . $prefix . 'case', 'none');
    $output .= "\t" . '--' . $h . '-case: ' . esc_attr($case) . ";\n";
}
```

- [ ] **Verify file**

Check that `typography_body_style` CSS var is also output. The var is `--font-body-style` from the css_var_map.

- [ ] **Commit**

```bash
git add includes/custom-css/typography.php
git commit -m "feat: generate CSS for per-heading typography with inheritance"
```

---

### Task 4: Update Google Font Enqueuing

**Files:**
- Modify: `phantom-core.php` (phantom_enqueue_google_fonts)
- Modify: `templates/shell.php` (inject_google_fonts)

- [ ] **Read phantom_enqueue_google_fonts()** in phantom-core.php at line 186

- [ ] **Update to collect all heading fonts**

```php
function phantom_enqueue_google_fonts(): void {
    $options = get_option('phantom_options', array());
    $fonts = array();
    
    // Body font
    $fonts[] = $options['typography_body_font'] ?? 'Archivo';
    
    // Heading default
    if (!empty($options['typography_heading_font'])) {
        $fonts[] = $options['typography_heading_font'];
    }
    
    // Per-heading fonts
    $headings = array('h1','h2','h3','h4','h5','h6');
    foreach ($headings as $h) {
        $key = 'typography_' . $h . '_font';
        if (!empty($options[$key])) {
            $fonts[] = $options[$key];
        }
    }
    
    // Remove duplicates
    $fonts = array_unique(array_filter($fonts));
    
    $url = \Phantom_Font_Families::instance()->get_font_enqueue_url(
        $fonts[0] ?? 'Archivo',
        $fonts[1] ?? 'Playfair Display'
    );
    
    wp_enqueue_style(
        'phantom-google-fonts',
        $url,
        array(),
        PHANTOM_CORE_VERSION
    );
}
```

Wait — the existing `get_font_enqueue_url()` only takes body + heading. We need to update it to accept multiple fonts. Let me update it in Task 1.

Actually, let me reconsider. The `get_font_enqueue_url($body_font, $heading_font)` takes exactly 2 params. I need to either:
A. Update the method to accept array of fonts
B. Build the URL directly

Option A is cleaner. Update `Phantom_Font_Families::get_font_enqueue_url()` to accept an array:

```php
public function get_font_enqueue_url($fonts = array(), array $subsets = array()): string {
    if (empty($fonts)) {
        $fonts = array('Archivo', 'Playfair Display');
    }
    if (is_string($fonts)) {
        $fonts = array($fonts);
    }
    $families = array();
    foreach ($fonts as $font) {
        $font = trim($font);
        if ('' !== $font) {
            $families[] = rawurlencode($font) . ':wght@100;200;300;400;500;600;700;800;900';
        }
    }
    // ... rest
}
```

- [ ] **Update `get_font_enqueue_url()` in class-phantom-font-families.php** to accept array parameter

- [ ] **Update phantom_enqueue_google_fonts()** to collect all unique fonts and pass as array

- [ ] **Update shell.php inject_google_fonts()** similarly

```php
private function inject_google_fonts(string $html): string {
    $options = get_option('phantom_options', array());
    $fonts = array();
    $fonts[] = $options['typography_body_font'] ?? 'Archivo';
    $headings = array('h1','h2','h3','h4','h5','h6');
    foreach ($headings as $h) {
        $key = 'typography_' . $h . '_font';
        if (!empty($options[$key])) {
            $fonts[] = $options[$key];
        }
    }
    $url = \PhantomCore\Fonts::instance()->get_enqueue_url($fonts[0] ?? 'Archivo', $fonts[1] ?? 'Playfair Display');
    ...
}
```

Actually, use the same updated method that accepts array. Let me update `Fonts::get_enqueue_url()` as well.

- [ ] **Update `Fonts::get_enqueue_url()`** to pass through array to `Phantom_Font_Families::get_font_enqueue_url()`

- [ ] **Commit**

```bash
git add phantom-core.php templates/shell.php includes/class-fonts.php includes/class-phantom-font-families.php
git commit -m "feat: update Google Font enqueuing to collect all heading fonts"
```

---

### Task 5: Update Customizer UI Organization

**Files:**
- Modify: `includes/class-customizer.php` — panel label, divider controls

- [ ] **Read class-customizer.php**

- [ ] **Rename Typography panel label**

Change `'title' => __( 'Typography', 'phantom-core' )` to `'title' => __( 'Typography & Fonts', 'phantom-core' )` at line 72.

- [ ] **Add divider entries for Customizer UI sections**

In `define_panels()`, ensure the typography section exists in the panel. Already does.

In `add_control()` method, the existing `divider` logic uses `$entry['divider']`. Add divider entries to settings:

For the settings in `section_typography()`, add `'divider' => 'ast-top-divider'` to the first setting after each logical group (e.g., `typography_body_style` gets a top divider, `typography_h1_font` gets a top divider, etc.).

Actually, the divider system works by setting the `divider` key on the entry. Let me add dividers to visually separate the groups:

- First body typography control (`typography_body_font`) — no divider needed
- After body controls, first H1 control — `'divider' => 'ast-top-divider'`
- After H1 group, first H2 control — `'divider' => 'ast-top-divider'`
- etc.
- Before font subsets — `'divider' => 'ast-top-divider'`

These dividers are added as `'divider' => 'ast-top-divider'` in the setting entry array.

- [ ] **Commit**

```bash
git add includes/class-customizer.php
git commit -m "feat: update Customizer UI with dividers and panel label"
```

---

### Task 6: Full Audit — Verify All Connections

No file changes — only verification.

- [ ] **Verify CSS var map completeness** — every new setting has a CSS var entry
- [ ] **Verify px_keys** — heading spacing keys included
- [ ] **Verify font inheritance chain** — per-heading → heading default → body font
- [ ] **Verify Google Font URL** — all unique heading fonts included
- [ ] **Verify no duplicate settings** — check for key collisions
- [ ] **Run PHP syntax check** on all modified files
- [ ] **Run PHPUnit tests** if available
- [ ] **Check for backward compatibility** — existing settings unchanged

- [ ] **Commit**

```bash
git add -A
git commit -m "audit: verify typography overhaul completeness and backward compat"
```
