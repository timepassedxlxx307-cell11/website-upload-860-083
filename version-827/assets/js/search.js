(function () {
  var data = window.MOVIE_INDEX || [];
  var form = document.getElementById('movieSearchForm');
  var input = document.getElementById('movieSearchInput');
  var typeSelect = document.getElementById('typeFilter');
  var yearSelect = document.getElementById('yearFilter');
  var results = document.getElementById('searchResults');
  var note = document.getElementById('searchNote');
  var loadMore = document.getElementById('loadMore');
  var visible = 48;
  var filtered = data.slice();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card card-hover">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-tags">' + tags + '</div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
      '<p class="movie-desc">' + escapeHtml(movie.oneLine).slice(0, 84) + '</p>' +
      '<div class="card-actions"><a class="text-link" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>' +
      '<a class="watch-link" href="' + escapeHtml(movie.url) + '">立即观看</a></div>' +
      '</div>' +
      '</article>';
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function applyFilters() {
    var query = input.value.trim().toLowerCase();
    var typeValue = typeSelect.value;
    var yearValue = yearSelect.value;
    visible = 48;
    filtered = data.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.category].concat(movie.tags).join(' ').toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = !typeValue || movie.type.indexOf(typeValue) !== -1;
      var matchYear = !yearValue || movie.year === yearValue;
      return matchQuery && matchType && matchYear;
    });
    render();
  }

  function render() {
    var shown = filtered.slice(0, visible);
    results.innerHTML = shown.map(card).join('');
    note.textContent = filtered.length ? '已匹配到相关影视内容' : '没有找到匹配内容';
    loadMore.style.display = filtered.length > visible ? 'inline-flex' : 'none';
  }

  function fillYears() {
    var years = Array.from(new Set(data.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort().reverse();
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
  }

  if (!form || !results) {
    return;
  }

  fillYears();
  input.value = getQuery();
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });
  input.addEventListener('input', applyFilters);
  typeSelect.addEventListener('change', applyFilters);
  yearSelect.addEventListener('change', applyFilters);
  loadMore.addEventListener('click', function () {
    visible += 48;
    render();
  });
  applyFilters();
}());
