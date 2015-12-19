import E from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default E.Component.extend(KeyboardShortcuts, {
  keyboardShortcuts: {
    esc: function() {
      this.toggleProperty('visible');
    }
  }
});
