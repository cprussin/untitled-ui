import E from 'ember';

var Browser = E.Object.extend({type: 'web-view'});

var Split = E.Object.extend({
  type: 'split-screen',
  title: 'Split',
  children: [],
  setDirection: E.on('init', function() {
    if (this.get('direction')) {return;}
    let tabbed = this.get('parent.direction') === 'tabbed';
    this.set('direction', tabbed ? 'horizontal' : 'tabbed');
  })
});

export default E.Service.extend({
  windows: Split.create(),
  isEmpty: E.computed.empty('windows.children'),
  selected: null,

  selectedIndex: E.computed('selected.parent.[]', 'selected', function() {
    if (!this.get('selected.parent')) {return -1;}
    return this.get('selected.parent.children').indexOf(this.get('selected'));
  }),

  toggleSelectState(win, selected) {
    let cursor = win;
    if (cursor) {cursor.set('selectedLeaf', selected);}
    while (cursor) {
      cursor.set('selected', selected);
      cursor = cursor.get('parent');
    }
  },

  select(win) {
    let selected = this.get('selected');
    if (win === selected) {return;}
    this.toggleSelectState(selected, false);
    this.toggleSelectState(win, true);
    this.set('selected', win || null);
  },

  createSplit() {
    if (this.get('isEmpty')) {return;}
    let children = this.get('selected.parent.children');
    let index = this.get('selectedIndex');
    children.removeObject(this.get('selected'));
    let split = Split.create({
      parent: this.get('selected.parent'),
      children: [this.get('selected')]
    });
    children.insertAt(index, split);
    this.get('selected').set('parent', split);
  },

  toUrl(str) {
    return str.startsWith('http') ? str : `http://${str}`;
  },

  createWindow(str) {
    let parent = this.get('selected.parent') || this.get('windows');
    let win = Browser.create({url: this.toUrl(str), parent: parent});
    parent.get('children').insertAt(this.get('selectedIndex') + 1, win);
    this.select(win);
  },

  launch(newWindow, newSplit, str) {
    if (newWindow || this.get('selected') === null) {
      if (newSplit) {this.createSplit();}
      this.createWindow(str);
    } else {
      this.get('selected').set('url', this.toUrl(str));
    }
  },

  close() {
    let index = this.get('selectedIndex');
    let split = this.get('selected.parent');
    if (split.get('children.length') - 1 === this.get('selectedIndex')) {
      index--;
    }
    split.get('children').removeObject(this.get('selected'));
    let newSelected = split.get('children').objectAt(index);
    if (split.get('children.length') === 1 && split.get('parent')) {
      index = split.get('parent.children').indexOf(split);
      split.get('parent.children').removeObject(split);
      split.get('parent.children').insertAt(index, newSelected);
      newSelected.set('parent', split.get('parent'));
    }
    this.select(newSelected);
  },

  toggleView() {
    if (this.get('selected.parent') === undefined) {return;}
    let direction;
    switch (this.get('selected.parent.direction')) {
      case 'tabbed':     direction = 'horizontal'; break;
      case 'horizontal': direction = 'vertical';   break;
      case 'vertical':   direction = 'tabbed';     break;
    }
    this.get('selected.parent').set('direction', direction);
  }
});
