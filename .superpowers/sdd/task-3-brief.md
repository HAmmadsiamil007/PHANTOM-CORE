# Task 3: Enhanced Product Finder Quiz

## Context
Shopify theme (PHANTOM v2.2.0) at `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\`. You are upgrading the EXISTING `quiz.liquid` and `quiz.js` with pro features.

**Read existing files first:**
- `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\sections\quiz.liquid`
- `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\assets\quiz.js`

## What to change

### 1. Rewrite `assets/quiz.js`
Replace the entire file with this enhanced version:

```javascript
class QuizRecommendation extends HTMLElement {
  connectedCallback() {
    this.intro = this.querySelector('[data-quiz-intro]');
    this.questions = Array.from(this.querySelectorAll('[data-quiz-question]'));
    this.results = this.querySelector('[data-quiz-results]');
    this.cards = this.querySelector('[data-quiz-cards]');
    this.progress = this.querySelector('[data-quiz-progress]');
    this.progressFill = this.querySelector('[data-quiz-progress-fill]');
    this.progressLabel = this.querySelector('[data-quiz-progress-label]');
    this.noResults = this.querySelector('[data-quiz-no-results]');
    this.resetBtn = this.querySelector('[data-quiz-reset]');
    this.startBtn = this.querySelector('[data-quiz-start]');
    this.productsToShow = parseInt(this.dataset.productsToShow) || 3;

    this.scores = {};
    this.currentQuestion = 0;
    this.animationStyle = this.dataset.animationStyle || 'slide';
    this.matchingMode = this.dataset.matchingMode || 'intersection';

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mq.matches;
    mq.addEventListener('change', (e) => { this.reducedMotion = e.matches; });

    this.startBtn?.addEventListener('click', () => this.start());
    this.resetBtn?.addEventListener('click', () => this.reset());

    this.questions.forEach((q, i) => {
      q.querySelectorAll('[data-quiz-option]').forEach(opt => {
        opt.addEventListener('click', () => this.selectOption(i, opt));
      });
    });
  }

  start() {
    this.intro?.classList.add('is-hidden');
    this.showQuestion(0);
  }

  showQuestion(index) {
    if (index >= this.questions.length) { this.showResults(); return; }
    this.questions.forEach((q, i) => {
      q.classList.toggle('is-hidden', i !== index);
      if (!this.reducedMotion && i === index) {
        q.style.animation = 'quizFadeIn 0.4s ease forwards';
      }
    });
    this.currentQuestion = index;
    this.updateProgress();
  }

  updateProgress() {
    if (!this.progress || !this.progressFill) return;
    const pct = ((this.currentQuestion + 1) / this.questions.length) * 100;
    this.progressFill.style.width = `${pct}%`;
    if (this.progressLabel) {
      this.progressLabel.textContent = `${this.currentQuestion + 1} / ${this.questions.length}`;
    }
  }

  selectOption(questionIndex, opt) {
    const handles = (opt.dataset.productHandles || '').split(',').filter(Boolean);
    const weight = parseFloat(opt.dataset.weight) || 1;

    if (this.matchingMode === 'weighted-score') {
      handles.forEach(h => { this.scores[h] = (this.scores[h] || 0) + weight; });
    } else {
      if (!this._accumulated) this._accumulated = [];
      this._accumulated.push(...handles);
    }

    this.showQuestion(questionIndex + 1);
  }

  async showResults() {
    this.questions.forEach(q => q.classList.add('is-hidden'));
    this.results?.classList.remove('is-hidden');
    if (!this.reducedMotion) this.results.style.animation = 'quizFadeIn 0.5s ease forwards';

    let handles;
    if (this.matchingMode === 'weighted-score') {
      handles = Object.entries(this.scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, this.productsToShow)
        .map(([h]) => h);
    } else {
      const freq = {};
      (this._accumulated || []).forEach(h => { freq[h] = (freq[h] || 0) + 1; });
      handles = [...new Set(this._accumulated || [])]
        .sort((a, b) => freq[b] - freq[a])
        .slice(0, this.productsToShow);
    }

    if (handles.length === 0) {
      this.noResults?.classList.remove('is-hidden');
      return;
    }

    this.noResults?.classList.add('is-hidden');
    const slots = this.querySelectorAll('[data-quiz-card-slot]');
    const promises = handles.map((handle, i) => {
      if (slots[i]) return this.fetchProduct(handle, slots[i]);
    });
    await Promise.all(promises);
  }

  async fetchProduct(handle, slot) {
    slot.classList.add('is-loading');
    try {
      const cached = this._getCache(handle);
      if (cached) { slot.innerHTML = cached; slot.classList.remove('is-loading'); return; }

      const res = await fetch(`${window.Shopify?.routes?.root || '/'}products/${handle}.js`);
      if (!res.ok) throw new Error('not found');
      const p = await res.json();
      const money = window.Shopify?.formatMoney
        ? window.Shopify.formatMoney(p.price)
        : `$${(p.price / 100).toFixed(2)}`;

      const html = `<div class="quiz-product-card">
        <a href="/products/${p.handle}">
          <img src="${p.featured_image || ''}" alt="${p.title}" loading="lazy" width="200" height="200" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px">
        </a>
        <h4 style="margin:8px 0 4px;font-size:0.95em"><a href="/products/${p.handle}" style="color:inherit;text-decoration:none">${p.title}</a></h4>
        <span style="font-weight:600">${money}</span>
        <form method="post" action="/cart/add" style="margin-top:8px">
          <input type="hidden" name="id" value="${p.variants[0]?.id}">
          <input type="hidden" name="quantity" value="1">
          <button type="submit" class="btn btn--small btn--full" style="width:100%">Add to Cart</button>
        </form>
      </div>`;

      this._setCache(handle, html);
      slot.innerHTML = html;
    } catch {
      slot.innerHTML = '';
    }
    slot.classList.remove('is-loading');
  }

  _getCache(handle) {
    try { return sessionStorage.getItem(`ph-quiz-${handle}`); } catch { return null; }
  }

  _setCache(handle, html) {
    try { sessionStorage.setItem(`ph-quiz-${handle}`, html); } catch {}
  }

  reset() {
    this.scores = {};
    this._accumulated = [];
    this.currentQuestion = 0;
    this.results?.classList.add('is-hidden');
    this.noResults?.classList.add('is-hidden');
    this.querySelectorAll('[data-quiz-card-slot]').forEach(s => { s.innerHTML = ''; s.classList.remove('is-loading'); });
    this.intro?.classList.remove('is-hidden');
    this.updateProgress();
  }
}
customElements.define('quiz-recommendation', QuizRecommendation);
```

### 2. Modify `sections/quiz.liquid`

Add to `<quiz-recommendation>` element:
- `data-animation-style="{{ section.settings.animation_style }}"`
- `data-matching-mode="{{ section.settings.matching_mode }}"`

Add progress bar markup AFTER the intro div and BEFORE the first question:
```liquid
<div class="quiz-progress" data-quiz-progress{% unless section.settings.show_progress_bar %} style="display:none"{% endunless %}>
  <div class="quiz-progress__bar">
    <div class="quiz-progress__fill" data-quiz-progress-fill style="width:0%;background:{{ section.settings.progress_bar_color }}"></div>
  </div>
  <span class="quiz-progress__label" data-quiz-progress-label>1 / {{ section.blocks.size }}</span>
</div>
```

Add to each option button: `data-weight="{{ block.settings.option_weight }}"`

Add progress bar CSS to the stylesheet:
```css
.quiz-progress {
  margin-bottom: 24px;
  text-align: center;
}
.quiz-progress__bar {
  height: 4px;
  background: color-mix(in srgb, var(--quiz-text), transparent 85%);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}
.quiz-progress__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.quiz-progress__label {
  font-size: 0.85em;
  opacity: 0.7;
}
@media (prefers-reduced-motion: reduce) {
  .quiz-progress__fill { transition: none; }
}
```

Add new settings to schema:
```json
{ "type": "header", "content": "Enhanced" },
{ "type": "checkbox", "id": "show_progress_bar", "label": "Show progress bar", "default": true },
{ "type": "color", "id": "progress_bar_color", "label": "Progress bar color", "default": "#000000" },
{ "type": "select", "id": "animation_style", "label": "Animation style", "default": "slide", "options": [
  { "value": "slide", "label": "Slide" },
  { "value": "fade", "label": "Fade" },
  { "value": "none", "label": "None" }
] },
{ "type": "select", "id": "matching_mode", "label": "Matching mode", "default": "intersection", "options": [
  { "value": "intersection", "label": "Tag intersection (current)" },
  { "value": "weighted-score", "label": "Weighted score" }
] }
```

Add to each option settings block:
```json
{ "type": "text", "id": "option_1_weight", "label": "Option 1 weight", "default": "1", "info": "Higher = more important" },
```
(Repeat for options 2, 3, 4)

And update the option button render to use the weight:
```
data-weight="{{ block.settings.option_{{ i }}_weight }}"
```

### 3. Modify locale files
Add these under `sections.quiz` (not a new section):
```json
"enhanced": {
  "progress_label": "{{ current }} / {{ total }}"
}
```

And add to `en.default.schema.json` (NOT `en.default.json`) under sections.quiz:
```json
"settings": {
  "show_progress_bar": "Show progress bar",
  "progress_bar_color": "Progress bar color",
  "animation_style": "Animation style",
  "animation_style_options": {
    "slide": "Slide",
    "fade": "Fade",
    "none": "None"
  },
  "matching_mode": "Matching mode",
  "matching_mode_options": {
    "intersection": "Tag intersection",
    "weighted-score": "Weighted score"
  }
}
```

## Report
Write to: `C:\Users\hamma\Downloads\phantom-theme\phantom-theme-v2.2.0\.superpowers\sdd\task-3-report.md`
Status, commit hash, summary, concerns.

## Do NOT
- Create any new files (only modify existing)
- Touch any other section/asset/snippet
- Refactor unrelated code