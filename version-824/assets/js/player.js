(function () {
  window.initMoviePlayer = function (url, videoSelector, buttonSelector) {
    var video = document.querySelector(videoSelector);
    var button = document.querySelector(buttonSelector);
    var hls = null;
    var isReady = false;
    if (!video || !button || !url) {
      return;
    }
    function bind() {
      if (isReady) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      isReady = true;
    }
    function start() {
      bind();
      button.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!isReady || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
