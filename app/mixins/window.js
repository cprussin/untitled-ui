import E from 'ember';

export default E.Mixin.create({
  windowManager: E.inject.service(),

  mouseMove() {
    if (this.get('window.parent.mode') === 'tabbed') {return;}
    this.get('windowManager').select(this.get('window'));
  }
});
