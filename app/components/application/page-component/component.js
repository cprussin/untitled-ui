import E from 'ember';
import {EKMixin, EKOnInsertMixin, keyUp} from 'ember-keyboard';
import Liquid from 'ui/mixins/liquid';

export default E.Component.extend(Liquid, EKMixin, EKOnInsertMixin, {
  audio: E.inject.service(),
  windowManager: E.inject.service(),
  launching: true,

  hideVolume() {
    this.set('volumeVisible', false);
  },

  showLauncherOnEmpty: E.observer('windowManager.isEmpty', function() {
    if (this.get('windowManager.isEmpty')) {
      this.set('launching', true);
    }
  }),

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

  watchVolumeKeys: E.on('didInsertElement', function() {
    let renderer = require('electron').ipcRenderer;
    renderer.on('volume', (event, message) => {
      switch(message) {
        case 'up':   this.get('audio').increase(); break;
        case 'down': this.get('audio').decrease(); break;
        case 'mute': this.get('audio').toggle();   break;
      }
      this.set('volumeVisible', true);
      E.run.debounce(this, this.hideVolume, 1000);
    });
  }),

  volumeOverlayClasses: E.computed('audio.mute', function() {
    var classes = ['volume-overlay'];
    if (this.get('audio.mute')) {classes.push('mute');}
    return classes.join(' ');
  }),

  launch: E.on(keyUp('meta+n'), function() {
    this.set('launching', true);
  }),

  toggleMode: E.on(keyUp('meta+ '), function() {
    if (this.get('windowManager.isEmpty')) {return;}
    this.get('windowManager').toggleView();
  }),

  actions: {
    toggleLauncher() {
      this.toggleProperty('launching');
    }
  }
});
