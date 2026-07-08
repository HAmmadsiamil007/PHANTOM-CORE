(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.documentElement.dataset.disableAnimations === 'true') return;

  var settings = window.phMotionSettings || {};
  var defaultAnim = settings.entranceDefault || 'ph-fade-up';
  if (!defaultAnim) return;

  /* ── Speed: set CSS custom property from settings ── */
  var speed = settings.entranceSpeed;
  if (speed && typeof speed === 'number') {
    document.documentElement.style.setProperty('--ph-duration', speed + 's');
  }

  /* ── Stagger: compute and apply delays ── */
  var staggerEnabled = settings.staggerEnabled;
  var staggerAmount = settings.staggerAmount || 100;

  var applyStagger = function() {
    if (!staggerEnabled) return;
    var containers = document.querySelectorAll('.grid, .grid--uniform, .grid-overflow-wrapper');
    for (var c = 0; c < containers.length; c++) {
      var items = containers[c].querySelectorAll('.grid__item[data-aos^="ph-"]');
      if (items.length < 2) continue;
      for (var i = 0; i < items.length; i++) {
        if (items[i].hasAttribute('data-aos-delay')) continue;
        var delay = Math.min(i * staggerAmount, 600);
        items[i].setAttribute('data-aos-delay', delay.toString());
      }
    }
  };

  var oldClasses = [
    'overflow__animation',
    'hero__animation',
    'logo__animation',
    'background-media-text__animation',
    'map-section__animation'
  ];

  var replaceFade = function() {
    for (var i = 0; i < oldClasses.length; i++) {
      var selector = '[data-aos="' + oldClasses[i] + '"]';
      var els = document.querySelectorAll(selector);
      for (var j = 0; j < els.length; j++) {
        els[j].setAttribute('data-aos', defaultAnim);
      }
    }
    applyStagger();
    if (typeof AOS !== 'undefined' && AOS) {
      AOS.refreshHard();
    }
  };

  replaceFade();

  var timeout;
  var debouncedReplace = function() {
    clearTimeout(timeout);
    timeout = setTimeout(replaceFade, 100);
  };

  var observer = new MutationObserver(debouncedReplace);
  observer.observe(document.body, { childList: true, subtree: true });
})();
