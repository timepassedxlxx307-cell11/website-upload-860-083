(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var track = slider.querySelector('[data-hero-track]');
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;
        function render(index) {
            current = (index + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + current * 100 + '%)';
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                render(current + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                render(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                render(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                render(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        if (slides.length > 1) {
            start();
        }
    }

    function initHorizontalScroll() {
        document.querySelectorAll('.scroll-section').forEach(function (section) {
            var scroller = section.querySelector('[data-horizontal-scroll]');
            var left = section.querySelector('[data-scroll-left]');
            var right = section.querySelector('[data-scroll-right]');
            if (!scroller) {
                return;
            }
            if (left) {
                left.addEventListener('click', function () {
                    scroller.scrollBy({ left: -420, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    scroller.scrollBy({ left: 420, behavior: 'smooth' });
                });
            }
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var searchInput = panel.querySelector('.js-search-input');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('.js-filter-select'));
        var reset = panel.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }
        function matchCard(card) {
            var query = normalize(searchInput ? searchInput.value : '');
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < selects.length; i += 1) {
                var select = selects[i];
                var key = select.getAttribute('data-filter');
                var selected = normalize(select.value);
                if (selected && normalize(card.getAttribute('data-' + key)) !== selected) {
                    return false;
                }
            }
            return true;
        }
        function render() {
            var visible = 0;
            cards.forEach(function (card) {
                var matched = matchCard(card);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }
        if (searchInput) {
            searchInput.addEventListener('input', render);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', render);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                selects.forEach(function (select) {
                    if (!select.querySelector('option[selected]')) {
                        select.value = '';
                    }
                });
                render();
            });
        }
        render();
    }

    window.initializeMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var poster = document.getElementById(options.posterId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var bound = false;
        var hlsInstance = null;
        if (!video || !poster || !button || !source) {
            return;
        }
        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function startPlayback(event) {
            if (event) {
                event.preventDefault();
            }
            bindSource();
            poster.classList.add('is-hidden');
            video.controls = true;
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }
        poster.addEventListener('click', startPlayback);
        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (!bound) {
                startPlayback();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initHorizontalScroll();
        initFilters();
    });
}());
