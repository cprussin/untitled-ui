import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'window.selected window.lastSelected window.mode'.w(),
  windowsLeft: new E.Handlebars.SafeString('left: 0;'),
  selectorPosition: new E.Handlebars.SafeString('left: 0; right: 50%;'),

  showTabs: E.computed('window.mode', 'window.children.length', function() {
    let tabbed = this.get('window.mode') === 'tabbed';
    return tabbed && this.get('window.children.length') > 1;
  }),

  setPositions: E.observer('window.children.@each.selected', function() {
    let children = this.get('window.children');
    let selected = children.filterBy('selected').get('firstObject');
    if (!selected) {return;}
    let index = children.indexOf(selected);
    let windowPosition = `left: -${index * 100}%;`;
    this.set('windowsLeft', new E.Handlebars.SafeString(windowPosition));
    let tabwidth = 100 / this.get('window.children.length'),
        left     = index * tabwidth,
        right    = 100 - ((index + 1) * tabwidth),
        min      = tabwidth / 2,
        max      = tabwidth * 2,
        tabPosition = `left: ${left}%; right: ${right}%;`;
    tabPosition += ` min-width: ${min}%; max-width: ${max}%;`;
    this.set('selectorPosition', new E.Handlebars.SafeString(tabPosition));
  }),

  actions: {
    select(win) {
      this.get('windowManager').select(win);
    }
  }
});
