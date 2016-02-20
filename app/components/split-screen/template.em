if showTabs: .tabs: each windows as |window|
  .tab click="'select' window" class=window.selected:selected #{window.title}
each windows as |window|
  if (eq window.type 'branch')
    split-screen .window direction=window.direction windows=window.windows
  else
    component .window window.type window=window
