/*
  index.js
  Long-press to navigate (mobile-friendly)
  - Default duration: 800ms
  - Customizable via CSS variable --press-duration on :root or per-tile
  - Destination is read from data-href

  Usage:
    <a class="tile" data-href="/somewhere"></a>

  Notes:
  - Click without long-press is prevented (to avoid accidental navigation)
  - Keyboard still works: Enter/Space navigates immediately
*/

(function () {
  /** @param {Element} el */
  function getPressDurationMs(el) {
    const v = getComputedStyle(el).getPropertyValue('--press-duration').trim();
    if (!v) return 800;
    // supports '800ms' or '0.8s'
    if (v.endsWith('ms')) return Number.parseFloat(v);
    if (v.endsWith('s')) return Number.parseFloat(v) * 1000;
    const asNum = Number.parseFloat(v);
    return Number.isFinite(asNum) ? asNum : 800;
  }

  function setupTile(tile) {
    let timerId = null;
    let pressing = false;

    const href = tile.getAttribute('data-href') || tile.getAttribute('href');

    // Prevent accidental tap navigation; we navigate ourselves after long-press.
    tile.addEventListener('click', (e) => {
      // If user is holding, or we haven't triggered long press, don't navigate.
      // Keyboard activation will be handled separately.
      e.preventDefault();
    });

    function startPress(e) {
      // Only primary button if mouse
      if (e.type === 'mousedown' && e.button !== 0) return;
      if (!href || href === '#') return;

      // ignore if already pressing
      if (pressing) return;
      pressing = true;

      tile.classList.add('is-pressed');
      tile.classList.add('is-pressing');

      const duration = getPressDurationMs(tile);
      timerId = window.setTimeout(() => {
        window.location.href = href;
      }, duration);
    }

    function cancelPress() {
      pressing = false;
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = null;
      }
      tile.classList.remove('is-pressing');
      tile.classList.remove('is-pressed');
    }

    // Pointer Events (covers touch + mouse in modern browsers)
    tile.addEventListener('pointerdown', startPress);
    tile.addEventListener('pointerup', cancelPress);
    tile.addEventListener('pointercancel', cancelPress);
    tile.addEventListener('pointerleave', cancelPress);

    // Keyboard accessibility: immediate navigation
    tile.addEventListener('keydown', (e) => {
      if (!href || href === '#') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = href;
      }
    });
  }

  document.querySelectorAll('.tile').forEach(setupTile);
})();
