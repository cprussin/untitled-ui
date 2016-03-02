import E from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Liquid from 'ui/mixins/liquid';

export default E.Component.extend(KeyboardShortcuts, Liquid, {
  audio: E.inject.service(),
  windowManager: E.inject.service(),
  initialUrl: E.computed.oneWay('url'),
  launching: true,

  setupTransitions: E.observer('liquid', function() {
    let liquid = this.get('liquid');
    'launcher status'.w().forEach((className) => {
      liquid.transition(
        liquid.hasClass(className),
        liquid.toValue(true),
        liquid.use('toDown'),
        liquid.reverse('toUp')
      );
    });
    liquid.transition(
      liquid.hasClass('volume-overlay'),
      liquid.use('fade')
    );
  }).on('init'),

  volumeOverlayClasses: E.computed('audio.mute', function() {
    var classes = ['volume-overlay'];
    if (this.get('audio.mute')) {classes.push('mute');}
    return classes.join(' ');
  }),

  hideVolume() {
    this.set('volumeVisible', false);
  },

  showVolume() {
    this.set('volumeVisible', true);
    E.run.debounce(this, this.hideVolume, 1000);
  },

  actions: {
    go: function(str, mode) {
      if (str === 'http://') {
        this.get('windowManager.selected').close();
        this.set('launching', this.get('windowManager.isEmpty'));
      } else {
        this.set('launching', false);
        this.get('windowManager').launch(str, mode);
      }
    }
  },

  keyboardShortcuts: {
    'meta+end': function() {
      this.get('audio').toggle();
      this.showVolume();
    },

    'meta+pageup': function() {
      this.get('audio').increase();
      this.showVolume();
    },

    'meta+pagedown': function() {
      this.get('audio').decrease();
      this.showVolume();
    },

    esc: function() {
      if (this.get('windowManager.isEmpty')) {return;}
      let properties = {launching: !this.get('launching')};
      if (properties.launching) {
        properties.initialUrl = this.get('windowManager.selected.uri');
        properties.showStatus = false;
      }
      this.setProperties(properties);
    },

    'meta+ins': function() {
      if (this.get('launching')) {return;}
      this.toggleProperty('showStatus');
    },

    'shift+space': function() {
      if (this.get('windowManager.isEmpty')) {return;}
      this.get('windowManager').toggleView();
    }
  }
});
