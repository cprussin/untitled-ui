import E from 'ember';

export default E.Service.extend({
  Browser: E.Object.extend({type: 'web-view', title: E.computed.alias('url')}),

  windows: E.Object.create({direction: 'tabbed', children: []}),
  isEmpty: E.computed.empty('windows.children'),
  selected: null,

  select(win) {
    if (win === this.get('selected')) {return;}
    if (win) {win.set('selected', true);}
    let sel = this.get('selected');
    if (sel !== null) {sel.set('selected', false);}
    this.set('selected', win || null);
  },

  launch(newWindow, str) {
    if (newWindow || this.get('selected') === null) {
      let win = this.Browser.create({
        url: `http://${str}`,
        parent: this.get('windows')
      });
      this.get('windows.children').pushObject(win);
      this.select(win);
    } else {
      this.get('selected').set('url', `http://${str}`);
    }
  },

  close() {
    this.get('windows.children').removeObject(this.get('selected'));
    this.select(this.get('windows.children.lastObject'));
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
