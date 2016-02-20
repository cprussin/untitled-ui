import E from 'ember';
import Liquid from 'ui/mixins/liquid';

export default E.Component.extend(Liquid, {
  date: true,

  setTime: E.on('init', function() {
    if (this.get('isDestroyed')) {return;}
    let now = new Date();
    this.setProperties({
      year    : now.getFullYear(),
      month   : ("00" + (now.getMonth() + 1)).slice(-2),
      day     : ("00" + (now.getDate() + 1)).slice(-2),
      hours   : ("00" + now.getHours()).slice(-2),
      minutes : ("00" + now.getMinutes()).slice(-2),
      seconds : ("00" + now.getSeconds()).slice(-2)
    });
    E.run.later(this, this.setTime, 1000 - now.getMilliseconds());
  }),

  setupTransitions: E.observer('liquid', function() {
    let liquid = this.get('liquid');
    liquid.transition(liquid.children(), liquid.use('toUp'));
  }).on('init')
});
