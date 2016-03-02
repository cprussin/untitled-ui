import E from 'ember';

export default E.Component.extend({
  days: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.w(),
  months: "January February Mark April May June July August September October\
           November December".w(),
  mode: 'tabbed',

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

  actions: {

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

    enter() {
      let url = this.get('value');
      url = url.startsWith('http') ? url : `http://${url}`;
      this.attrs['enter'](url, this.get('mode'));
    }
  }
});
