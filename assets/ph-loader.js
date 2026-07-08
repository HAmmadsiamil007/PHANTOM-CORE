(function () {
  'use strict';

  var loader = document.getElementById('ph-loader');
  if (!loader) return;

  var logo = loader.querySelector('.ph-loader__logo, .ph-loader__logo--text');
  var arc = loader.querySelector('.ph-loader__arc-progress');
  var tagline = loader.querySelector('.ph-loader__tagline');
  var minDuration = parseInt(loader.dataset.duration, 10) || 1500;
  var startTime = Date.now();
  var exited = false;

  var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDisabled = document.documentElement.getAttribute('data-disable-animations') === 'true';

  if (isReduced || isDisabled) {
    loader.classList.add('ph-loader--hidden');
    return;
  }

  function initAnimations() {
    if (logo) {
      logo.animate(
        [
          { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          { opacity: '1', transform: 'translateY(0) scale(1)' }
        ],
        { duration: minDuration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
      );
    }

    if (arc) {
      arc.animate(
        [
          { strokeDashoffset: '113' },
          { strokeDashoffset: '0' }
        ],
        { duration: minDuration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
      );
    }

    if (tagline) {
      setTimeout(function () {
        tagline.style.opacity = '0.5';
      }, 500);
    }
  }

  function exitLoader() {
    if (exited) return;
    exited = true;

    var elapsed = Date.now() - startTime;
    var remaining = Math.max(0, minDuration - elapsed);

    setTimeout(function () {
      loader.classList.add('ph-loader--exit');

      loader.addEventListener('animationend', function () {
        loader.classList.add('ph-loader--hidden');
        loader.remove();
      }, { once: true });

      setTimeout(function () {
        if (loader.parentNode) {
          loader.classList.add('ph-loader--hidden');
          loader.remove();
        }
      }, 600);
    }, remaining);
  }

  initAnimations();

  if (document.readyState === 'complete') {
    exitLoader();
  } else {
    window.addEventListener('load', exitLoader);
  }

  var timeout = setTimeout(function () {
    exitLoader();
  }, minDuration + 3000);

  document.addEventListener('shopify:section:load', function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      exitLoader();
    }, 500);
  });
})();
