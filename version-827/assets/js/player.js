(function () {
  function attachPlayer(frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.play-overlay');
    var src = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var ready = false;

    if (!video || !src) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function play() {
      prepare();
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        frame.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll('.video-player').forEach(attachPlayer);
}());
