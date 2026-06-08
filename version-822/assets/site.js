(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var filterForm = document.querySelector('[data-card-filter]');
  if (filterForm) {
    var queryInput = filterForm.querySelector('[data-filter-query]');
    var yearSelect = filterForm.querySelector('[data-filter-year]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilter() {
      var query = normalize(queryInput && queryInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
        card.classList.toggle('card-hidden', !(matchesQuery && matchesYear && matchesType));
      });
    }

    [queryInput, yearSelect, typeSelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  var pageSearch = document.querySelector('[data-page-search]');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function renderSearch(query) {
    if (!searchResults || typeof MOVIE_SEARCH_INDEX === 'undefined') {
      return;
    }

    var q = normalize(query);
    var source = MOVIE_SEARCH_INDEX;
    var list = q
      ? source.filter(function (item) {
          return normalize([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ')).indexOf(q) !== -1;
        })
      : source.slice(0, 48);

    list = list.slice(0, 96);
    searchResults.innerHTML = list.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-mark">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<div class="tag-line"><span>' + escapeHtml(item.category) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  if (pageSearch) {
    var pageInput = pageSearch.querySelector('input[name="q"]');
    var initialQuery = getQuery();
    if (pageInput) {
      pageInput.value = initialQuery;
    }
    renderSearch(initialQuery);
    pageSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = pageInput ? pageInput.value : '';
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState(null, '', url.toString());
      renderSearch(query);
    });
  }
})();
