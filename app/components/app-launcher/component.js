import E from 'ember';
export default E.Component.extend({
  days: 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.w(),
  months: "January February Mark April May June July August September October\
           November December".w(),

  open: E.computed('value', function() {
    return !E.isEmpty(this.get('value'));
  }),

  selectInputOnShow: E.on('didInsertElement', function() {
    let method = E.isEmpty(this.get('value')) ? 'focus' : 'select';
    this.$('input')[method]();
  }),

  setShowBackground: E.on('init', function() {
    this.set('showBackground', E.isEmpty(this.get('value')));
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

    handleEnter() {
      this.set('showBackground', E.isEmpty(this.get('value')));
      if (this.attrs['update'] !== undefined) {
        this.attrs['update'](this.get('value'));
      }
      if (this.attrs['enter'] !== undefined) {
        this.attrs['enter']();
      }
    }
  }
});
