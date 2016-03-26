import E from 'ember';

export default E.Component.extend({
  audio: E.inject.service(),
  network: E.inject.service(),
  windowManager: E.inject.service(),
  showMenuButton: true,
  classNameBindings: 'hideBackground hidden'.w(),

  setupMenuHiding: E.observer('hideBackground', function() {
    if (this.get('hideBackground')) {
      this.setProperties({hidden: false, allowHiding: false});
    } else {
      this.setProperties({allowHiding: true});
      this.mouseLeave();
    }
  }),

  hideMenu() {
    if (this.get('allowHiding')) {
      this.set('hidden', true);
    }
  },

  mouseMove() {
    this.set('hidden', false);
  },

  mouseLeave() {
    E.run.debounce(this, this.hideMenu, 1000);
  },

  actions: {
    clickMenu() {
      if (!this.get('windowManager.isEmpty')) {
        this.sendAction('clickMenu');
      }
    }
  }
});
