import E from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Liquid from 'ui/mixins/liquid';

export default E.Component.extend(KeyboardShortcuts, Liquid, {
  audio: E.inject.service(),
  launching: true,
  initialUrl: E.computed.oneWay('url'),

  hideVolume() {
    this.set('volumeVisible', false);
  },

  showVolume() {
    this.set('volumeVisible', true);
    E.run.debounce(this, this.hideVolume, 1000);
  },

  volumeOverlayClasses: E.computed('audio.mute', function() {
    var classes = ['volume-overlay'];
    if (this.get('audio.mute')) {classes.push('mute');}
    return classes.join(' ');
  }),

  setupTransitions: E.observer('liquid', function() {
    let liquid = this.get('liquid');
    liquid.transition(
      liquid.hasClass('launcher'),
      liquid.toValue(true),
      liquid.use('toDown'),
      liquid.reverse('toUp')
    );
  }).on('init'),

  actions: {
    closeLauncher: function() {
      if (E.isEmpty(this.get('url'))) {return;}
      this.setProperties({launching: false});
    }
  },

  keyboardShortcuts: {
    'meta+end': function() {
      this.get('audio').toggle();
      if (!this.get('launching')) {this.showVolume();}
    },

    'meta+pageup': function() {
      this.get('audio').increase();
      if (!this.get('launching')) {this.showVolume();}
    },

    'meta+pagedown': function() {
      this.get('audio').decrease();
      if (!this.get('launching')) {this.showVolume();}
    },

    esc: function() {
      if (E.isEmpty(this.get('url'))) {return;}
      this.toggleProperty('launching');
      if (this.get('launching')) {
        this.setProperties({
          volumeVisible: false,
          initialUrl: this.get('url')
        });
      }
    }
  }
});
