(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5000);
  }

  const filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    const input = filterScope.querySelector('[data-filter-input]');
    const yearSelect = filterScope.querySelector('[data-filter-year]');
    const typeSelect = filterScope.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(input ? input.value : '');
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-search'));
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchYear = !year || cardYear === year;
        const matchType = !type || cardType === type;
        const matched = matchQuery && matchYear && matchType;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    let attached = false;

    function attachStream() {
      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!attached) {
          const hls = new window.Hls({
            enableWorker: true
          });

          hls.loadSource(stream);
          hls.attachMedia(video);
          attached = true;
        }
      } else if (!video.src) {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      shell.classList.add('is-playing');

      const playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('click', function () {
      if (!video.src && !attached) {
        startPlayback();
      }
    });
  });
}());
