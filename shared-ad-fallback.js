/* Averthan Games — ad-fill fallback
 * Keeps ad containers collapsed until AdSense actually fills the slot.
 * Browsers that support :has() already handle this via CSS (shared.css).
 * This script is for older browsers: it watches every .adsbygoogle <ins>
 * for data-ad-status changes and adds .av-ad-filled to the parent when
 * AdSense reports a filled slot.
 */
(function () {
  // Skip if the browser already supports :has() — CSS handles it faster.
  try {
    if (CSS && CSS.supports && CSS.supports('selector(:has(*))')) return;
  } catch (e) {}

  function markIfFilled(ins) {
    if (ins.getAttribute('data-ad-status') === 'filled') {
      var host = ins.closest('.ad-container, .ad-anchor');
      if (host) host.classList.add('av-ad-filled');
    }
  }

  function watchAll() {
    var inses = document.querySelectorAll('ins.adsbygoogle');
    for (var i = 0; i < inses.length; i++) {
      markIfFilled(inses[i]);
      try {
        new MutationObserver(function (muts) {
          for (var j = 0; j < muts.length; j++) markIfFilled(muts[j].target);
        }).observe(inses[i], { attributes: true, attributeFilter: ['data-ad-status'] });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchAll);
  } else {
    watchAll();
  }
})();
