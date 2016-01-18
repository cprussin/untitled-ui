import E from 'ember';
import Liquid from 'liquid-fire/dsl';

export default E.Mixin.create({
  transitionMap: E.inject.service('liquid-fire-transitions'),

  liquid: E.computed('transitionMap', function() {
    let liquid = new Liquid(this.get('transitionMap'));
    liquid.children = () => liquid.childOf('#' + this.get('elementId'));
    return liquid;
  })
});
