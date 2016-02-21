liquid-if volumeVisible class=volumeOverlayClasses: = audio.volume
liquid-if .status showStatus: status-bar .status-bar
liquid-if .launcher launching: app-launcher [
  class='app-launcher'
  showBackground=windowManager.isEmpty
  value=initialUrl
  enter=(action 'go') ]
split-screen .split-screen window=windowManager.windows
