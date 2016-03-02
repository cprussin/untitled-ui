if showTabs
  .tabs
    each window.children as |window|
      .tab click="'select' window" class=window.selected:selected class=window.lastSelected:last-selected #{window.title}
    .selector style=selectorPosition
.windows style=windowsLeft: each window.children as |window|
  component window.type class='window' window=window
