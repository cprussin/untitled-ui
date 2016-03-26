import E from 'ember';

// Nodes in the tree.  Called Viewport instead of Window because javascript.
var Viewport = E.Object.extend({

  // The parent window of this one.
  parent: null,

  // True when this window is selected.
  selected: false,

  // Call this to close a window.
  close() {
    this.get('parent.children').removeObject(this);
  }

});

// Browsers load web pages.
var Browser = Viewport.extend({

  // Use the web-view component.
  type: 'web-view'

});

// Splits are windows that have children and are never leaves of the tree.
var Split = Viewport.extend({

  // Use the split-screen component.
  type: 'split-screen',

  // A boring window title.  TODO make this more useful.
  title: 'Split',

  // The set of children of this split.
  children: [],

  // True if there are no children.
  isEmpty: E.computed.empty('children'),

  // The currently selected child, if any is selected.
  selectedChild: E.computed('children.@each.selected', function() {
    return this.get('children').filterBy('selected').get('firstObject');
  }),

  // Insert a window into this split.  Does so by splitting the selected window
  // in the given mode if this split is not already in that mode.
  //
  // - win: The new window to insert
  // - mode: The Split mode to open the new window in
  insert(win, mode) {
    let selected = this.get('selectedChild'),
        index    = this.get('children').indexOf(selected);
    if (this.get('mode') !== mode) {
      this.get('children').removeObject(selected);
      win = Split.create({mode: mode, children: [selected, win]});
      win.get('children').setEach('parent', win);
    } else {
      index++;
    }
    win.set('parent', this);
    this.get('children').insertAt(index, win);
  }

});

// This service contains a window manager tree.  Window types are defined above.
// Split windows are branches in the tree, all other windows are leaves.
export default E.Service.extend({

  // The currently selected window.
  selected: null,

  // The root window.
  root: Split.create({mode: 'tabbed'}),
  activeSplit: E.computed.or('selected.parent', 'root'),

  // True if there are no windows.
  isEmpty: E.computed.alias('root.isEmpty'),

  // Close the given window.
  close(window) {
    if (window.get('selected')) {
      let children = window.get('parent.children'),
          index = children.indexOf(window) + 1;
      if (index >= children.length) {
        index -= 2;
      }
      this.select(children.objectAt(index));
    }
    window.close();
  },

  // Select the given window.
  select(window) {
    if (this.get('selected')) {
      this.get('selected').setProperties({selected: false});
    }
    window.set('selected', true);
    this.set('selected', window);
  },

  // Launch the given string in the given mode.  If the mode is 'go', then the
  // current window is replaced by launching the given string.  If the mode is
  // 'tabbed', 'horizontal', or 'vertical', then we check to see if the selected
  // window's parent split is already split in that mode.  If it is, we add
  // another sibling window.  If it isn't, we split the selected window with the
  // new window in the given mode.  Arguments:
  //
  // - uri: The uri that should be launched
  // - mode: The mode to split with, or 'go' to change the uri of the selected
  //     window
  launch(uri, mode, options = {}) {
    let isEmpty = this.get('isEmpty');
    if (mode === 'go' && !isEmpty) {
      this.get('selected').set('uri', uri);
    } else {
      let win = Browser.create({uri: uri});
      this.get('activeSplit').insert(win, isEmpty ? 'tabbed' : mode);
      if (options.select !== false) {
        this.select(win);
      }
    }
  },

  // Toggles the view of the selected window's parent from tabbed to horizontal,
  // horizontal to vertical, or vertical to tabbed.
  toggleView() {
    let mode = this.get('selected.parent.mode');
    switch (mode) {
      case 'tabbed':     mode = 'horizontal'; break;
      case 'horizontal': mode = 'vertical';   break;
      case 'vertical':   mode = 'tabbed';     break;
    }
    if (mode) {
      this.get('selected.parent').set('mode', mode);
    }
  }

});
