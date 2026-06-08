(() => {
    const body = document.body;
    const toggle = document.querySelector('.mobile-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            body.classList.toggle('menu-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        };
        const next = () => show(current + 1);
        const prev = () => show(current - 1);
        const nextButton = hero.querySelector('[data-hero-next]');
        const prevButton = hero.querySelector('[data-hero-prev]');
        if (nextButton) nextButton.addEventListener('click', next);
        if (prevButton) prevButton.addEventListener('click', prev);
        dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
        if (slides.length > 1) {
            setInterval(next, 5200);
        }
    }

    const searchInputs = document.querySelectorAll('[data-search-input]');
    searchInputs.forEach((input) => {
        const scope = document;
        const cards = Array.from(scope.querySelectorAll('[data-card-list] article'));
        input.addEventListener('input', () => {
            const value = input.value.trim().toLowerCase();
            cards.forEach((card) => {
                const text = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('hidden-by-search', value && !text.includes(value));
            });
        });
    });

    const players = document.querySelectorAll('[data-player]');
    players.forEach((player) => {
        const video = player.querySelector('video');
        const url = player.getAttribute('data-hls');
        const playButtons = [player.querySelector('[data-play]'), player.querySelector('.player-overlay')].filter(Boolean);
        const muteButton = player.querySelector('[data-mute]');
        const fullscreenButton = player.querySelector('[data-fullscreen]');
        let hlsInstance = null;

        const prepare = () => {
            if (!url || video.dataset.ready === '1') return;
            video.dataset.ready = '1';
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }
        };

        const update = () => {
            player.classList.toggle('playing', !video.paused && !video.ended);
            const playButton = player.querySelector('[data-play]');
            if (playButton) {
                playButton.textContent = video.paused ? '播放' : '暂停';
            }
            if (muteButton) {
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            }
        };

        const togglePlay = async () => {
            prepare();
            try {
                if (video.paused) {
                    await video.play();
                } else {
                    video.pause();
                }
            } catch (error) {
                player.classList.remove('playing');
            }
            update();
        };

        playButtons.forEach((button) => button.addEventListener('click', togglePlay));
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', update);
        video.addEventListener('pause', update);
        video.addEventListener('ended', update);
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                video.muted = !video.muted;
                update();
            });
        }
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', async () => {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    await player.requestFullscreen();
                }
            });
        }
        window.addEventListener('beforeunload', () => {
            if (hlsInstance) hlsInstance.destroy();
        });
    });
})();
