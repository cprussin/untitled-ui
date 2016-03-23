if showTabs
  .tabs
    each window.children as |window|: split-screen/window-title window=window
    .selector style=selectorPosition
.windows style=windowsLeft: each window.children as |window|
  component window.type class='window' window=window
