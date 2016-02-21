if showTabs: .tabs: each window.children as |window|
  .tab click="'select' window" class=window.selected:selected #{window.title}
.windows: each window.children as |window|
  component window.type class='window' window=window
