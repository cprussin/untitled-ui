.tabs
  .selector style=selectorPosition
  liquid-bind .liquid-tabs window.children as |windows|
    each windows as |window|: split-screen/window-title .tab window=window
.windows style=windowsLeft: each window.children as |window|
  component window.type class='window' window=window
