import E from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default E.Component.extend(KeyboardShortcuts, {
  launching: true,
  initialUrl: E.computed.oneWay('url'),

  actions: {
    closeLauncher: function() {
      if (E.isEmpty(this.get('url'))) {return;}
      this.setProperties({launching: false});
    }
  },

  keyboardShortcuts: {
    esc: function() {
      if (E.isEmpty(this.get('url'))) {return;}
      this.toggleProperty('launching');
      if (this.get('launching')) {
        this.set('initialUrl', this.get('url'));
      }
    }
  }
});
