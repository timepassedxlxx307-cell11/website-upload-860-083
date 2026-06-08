(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initQuerySearch();
        initPlayers();
        initScrollButtons();
    });

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = !nav.classList.contains('is-open');
            nav.classList.toggle('is-open', open);
            button.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = document.querySelector('.page-search-input');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        }
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('.page-search-input');
            var status = panel.querySelector('.filter-status');
            var section = panel.closest('.page-section') || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
            var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
            var filterField = 'all';
            var filterValue = 'all';

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var shown = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var fieldMatches = true;
                    if (filterField !== 'all') {
                        fieldMatches = (card.getAttribute('data-' + filterField) || '') === filterValue;
                    }
                    var keywordMatches = !keyword || text.indexOf(keyword) !== -1;
                    var visible = fieldMatches && keywordMatches;
                    card.classList.toggle('is-hidden', !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (status) {
                    status.textContent = shown ? '已显示匹配影片' : '没有匹配的影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    chip.classList.add('is-active');
                    filterField = chip.getAttribute('data-filter-field') || 'all';
                    filterValue = chip.getAttribute('data-filter-value') || 'all';
                    apply();
                });
            });
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var source = shell.getAttribute('data-m3u8');
            var hlsInstance = null;
            var started = false;

            function start() {
                if (!video || !source) {
                    return;
                }
                if (!started) {
                    started = true;
                    video.setAttribute('controls', 'controls');
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            shell.addEventListener('click', function (event) {
                if (event.target && event.target.closest && event.target.closest('video')) {
                    return;
                }
                start();
            });

            if (overlay) {
                overlay.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initScrollButtons() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                var player = document.querySelector('.player-shell');
                if (player) {
                    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    var overlay = player.querySelector('.player-overlay');
                    if (overlay) {
                        overlay.click();
                    }
                }
            });
        });
    }
})();
