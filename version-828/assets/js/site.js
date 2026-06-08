function setActiveHero(slides, dots, index) {
    slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
    });
    dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
    });
}

function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
        return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var go = function (index) {
        current = (index + slides.length) % slides.length;
        setActiveHero(slides, dots, current);
    };
    if (slides.length < 2) {
        return;
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            go(index);
        });
    });
    if (prev) {
        prev.addEventListener("click", function () {
            go(current - 1);
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            go(current + 1);
        });
    }
    window.setInterval(function () {
        go(current + 1);
    }, 5000);
}

function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-movie-list]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    if (!list || (!input && chips.length === 0)) {
        return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-item"));
    var activeFilter = "all";
    var apply = function () {
        var query = input ? normalizeText(input.value) : "";
        cards.forEach(function (card) {
            var title = normalizeText(card.getAttribute("data-title"));
            var meta = normalizeText(card.getAttribute("data-meta"));
            var type = normalizeText(card.getAttribute("data-type"));
            var year = normalizeText(card.getAttribute("data-year"));
            var matchQuery = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1;
            var filter = normalizeText(activeFilter);
            var matchFilter = filter === "all" || type.indexOf(filter) !== -1 || year.indexOf(filter) !== -1 || meta.indexOf(filter) !== -1;
            card.classList.toggle("hidden", !(matchQuery && matchFilter));
        });
    };
    if (input) {
        input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (item) {
                item.classList.remove("active");
            });
            chip.classList.add("active");
            activeFilter = chip.getAttribute("data-filter-value") || "all";
            apply();
        });
    });
}

function initMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !cover || !streamUrl) {
        return;
    }
    var ready = false;
    var hlsItem = null;
    var bind = function () {
        if (ready) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsItem = new window.Hls();
            hlsItem.loadSource(streamUrl);
            hlsItem.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        ready = true;
    };
    var play = function () {
        bind();
        cover.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    };
    cover.addEventListener("click", play);
    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!ready || video.paused) {
            play();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsItem && typeof hlsItem.destroy === "function") {
            hlsItem.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
});
