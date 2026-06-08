document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    filterForms.forEach(function (form) {
        var keyword = form.querySelector("[data-filter-keyword]");
        var year = form.querySelector("[data-filter-year]");
        var type = form.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function matchCard(card) {
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-category") || ""
            ].join(" ").toLowerCase();
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var okKeyword = !keywordValue || text.indexOf(keywordValue) !== -1;
            var okYear = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
            var okType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
            return okKeyword && okYear && okType;
        }

        function applyFilter() {
            cards.forEach(function (card) {
                card.classList.toggle("hidden-by-filter", !matchCard(card));
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });
        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        applyFilter();
    });

    Array.prototype.slice.call(document.querySelectorAll(".player-stage")).forEach(function (stage) {
        var video = stage.querySelector(".video-player");
        var trigger = stage.querySelector(".play-panel");
        var message = stage.querySelector(".player-message");
        var hlsInstance = null;
        var attached = false;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add("show");
            }
        }

        function begin() {
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            if (!stream) {
                showMessage("播放加载失败，请稍后重试");
                return;
            }
            if (!attached) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    attached = true;
                } else if (window.Hls) {
                    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage("播放加载失败，请稍后重试");
                        }
                    });
                    attached = true;
                } else {
                    video.src = stream;
                    attached = true;
                }
            }
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (trigger) {
                        trigger.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (trigger) {
            trigger.addEventListener("click", begin);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
            });
            video.addEventListener("error", function () {
                showMessage("播放加载失败，请稍后重试");
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
