import E from 'ember';
import {EKMixin, EKOnInsertMixin, keyUp} from 'ember-keyboard';

export default E.Component.extend(EKMixin, EKOnInsertMixin, {
  search: E.inject.service(),
  windowManager: E.inject.service(),

  days: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.w(),
  months: "January February Mark April May June July August September October\
           November December".w(),
  mode: 'tabbed',

  showBackground: E.computed.alias('windowManager.isEmpty'),

  updateSearch: E.observer('value', function() {
    if (!E.isEmpty(this.get('value'))) {
      this.get('search').search(this.get('value'));
    } else {
      this.get('search').clear();
    }
  }),

  open: E.computed('value', function() {
    return !E.isEmpty(this.get('value'));
  }),

  selectInputOnShow: E.on('didInsertElement', function() {
    let method = E.isEmpty(this.get('value')) ? 'focus' : 'select';
    this.$('input')[method]();
  }),

  setDate: E.on('init', function() {
    if (this.get('isDestroyed')) {return;}
    let now     = new Date(),
        millis  = now.getMilliseconds(),
        weekday = this.get('days')[now.getDay()],
        month   = this.get('months')[now.getMonth()],
        day     = now.getDate(),
        year    = now.getFullYear();
    this.set('date', `${weekday} ${month} ${day}, ${year}`);
    millis += now.getSeconds() * 1000;
    millis += now.getMinutes() * 60000;
    millis += now.getHours()   * 3600000;
    E.run.later(this, this.setTime, 86400000 - millis);
  }),

  go(url) {
    if (url === 'http://') {
      this.get('windowManager.selected').close();
      this.doClose();
    } else {
      this.get('windowManager').launch(url, this.get('mode'));
      this.get('toggle')();
    }
  },

  doClose: E.on(keyUp('Escape'), function() {
    if (!this.get('windowManager.isEmpty')) {
      this.get('toggle')();
    }
  }),

  actions: {

    openMessages() {
      this.go('http://inbox.google.com');
    },

    openCalendar() {
      this.go('http://calendar.google.com');
    },

    openNotes() {
      this.go('http://wunderlist.com');
    },

    toggleMode() {
      let mode = this.get('mode');
      switch (mode) {
        case 'go': mode = 'tabbed'; break;
        case 'tabbed': mode = 'horizontal'; break;
        case 'horizontal': mode = 'vertical'; break;
        case 'vertical': mode = 'go'; break;
      }
      this.set('mode', mode);
    },

    go(url = this.get('value')) {
      url = url.startsWith('http') ? url : `http://${url}`;
      this.go(url);
      this.get('search').clear();
    },

    close() {
      this.doClose();
    }
  }
});
