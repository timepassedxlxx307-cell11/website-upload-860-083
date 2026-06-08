(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    selectAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-filter-input]');
      var typeSelect = area.querySelector('[data-filter-type]');
      var regionSelect = area.querySelector('[data-filter-region]');
      var empty = area.querySelector('[data-filter-empty]');
      var grid = area.parentElement.querySelector('.movie-grid');
      var cards = grid ? selectAll('[data-movie-card]', grid) : [];
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      function apply() {
        var keyword = normalize(input ? input.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var regionValue = normalize(regionSelect ? regionSelect.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var typeText = normalize(card.getAttribute('data-type'));
          var regionText = normalize(card.getAttribute('data-region'));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchType = !typeValue || typeText.indexOf(typeValue) !== -1;
          var matchRegion = !regionValue || regionText.indexOf(regionValue) !== -1;
          var matched = matchKeyword && matchType && matchRegion;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
