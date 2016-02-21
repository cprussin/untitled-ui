import E from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';
import Liquid from 'ui/mixins/liquid';

export default E.Component.extend(KeyboardShortcuts, Liquid, {
  audio: E.inject.service(),
  windowManager: E.inject.service(),
  initialUrl: E.computed.oneWay('url'),
  launching: true,
  newWindow: false,
  newSplit: false,

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

  close() {
    if (this.get('newWindow')) {
      this.setProperties({newWindow: false, launching: false});
    } else {
      this.get('windowManager').close();
      this.set('launching', this.get('windowManager.isEmpty'));
    }
    this.set('newSplit', false);
  },

  go(str) {
    let newWindow = this.get('newWindow'), newSplit = this.get('newSplit');
    this.get('windowManager').launch(newWindow, newSplit, str);
    this.setProperties({launching: false, newWindow: false, newSplit: false});
  },

  actions: {
    go: function(str) {
      if (E.isEmpty(str)) {
        this.close();
      } else {
        this.go(str);
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

    'shift+esc': function() {
      this.set('newWindow', true);
      this.get('keyboardShortcuts.esc').call(this);
    },

    'esc+tab': function() {
      this.setProperties({newWindow: true, newSplit: true});
      this.get('keyboardShortcuts.esc').call(this);
    },

    esc: function() {
      if (this.get('windowManager.isEmpty')) {return;}
      this.toggleProperty('launching');
      if (this.get('launching')) {
        let url = this.get('windowManager.selected.url');
        this.setProperties({
          initialUrl: this.get('newWindow') ? '' : url,
          showStatus: false
        });
      } else {
        this.setProperties({newWindow: false, newSplit: false});
      }
    },

    'meta+ins': function() {
      if (this.get('launching')) {return;}
      this.toggleProperty('showStatus');
    },

    'shift+space': function() {
      this.get('windowManager').toggleView();
    }
  }
});
