(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        if (!filters.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var query = normalize(document.querySelector("[data-filter='query']") && document.querySelector("[data-filter='query']").value);
            var type = normalize(document.querySelector("[data-filter='type']") && document.querySelector("[data-filter='type']").value);
            var year = normalize(document.querySelector("[data-filter='year']") && document.querySelector("[data-filter='year']").value);
            var region = normalize(document.querySelector("[data-filter='region']") && document.querySelector("[data-filter='region']").value);

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var visible = true;

                if (query && text.indexOf(query) === -1) {
                    visible = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    visible = false;
                }
                if (year && cardYear !== year) {
                    visible = false;
                }
                if (region && cardRegion.indexOf(region) === -1) {
                    visible = false;
                }

                card.classList.toggle("hidden-by-filter", !visible);
            });
        }

        filters.forEach(function (filter) {
            filter.addEventListener("input", apply);
            filter.addEventListener("change", apply);
        });
    }

    function initPlayers() {
        var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
        frames.forEach(function (frame) {
            var video = frame.querySelector("video");
            var overlay = frame.querySelector(".player-overlay");
            if (!video || !overlay) {
                return;
            }
            var url = video.getAttribute("data-video-url");
            var active = false;
            var hls = null;

            function start() {
                if (!url) {
                    return;
                }
                overlay.classList.add("is-hidden");
                if (active) {
                    video.play().catch(function () {});
                    return;
                }
                active = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            hls.destroy();
                            hls = null;
                            video.src = url;
                            video.play().catch(function () {});
                        }
                    });
                } else {
                    video.src = url;
                    video.play().catch(function () {});
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!active) {
                    start();
                }
            });
        });
    }
})();
