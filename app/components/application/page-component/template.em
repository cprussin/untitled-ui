/ The volume overlay
liquid-if volumeVisible class=volumeOverlayClasses: = audio.volume

/ The status bar
status-bar [
  class=status-bar
  hideBackground=launching
  clickMenu=(action 'toggleLauncher') ]

/ The app launcher
liquid-if .launcher launching
  app-launcher .app-launcher toggle=(action 'toggleLauncher')

/ The window manager
component .window-manager windowManager.root.type window=windowManager.root
