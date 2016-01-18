liquid-if .launcher launching use='fade'
  app-launcher .app-launcher value=initialUrl update=(action (mut url)) enter=(action 'closeLauncher')
window-manager .window-manager url=(concat 'http://' url)
