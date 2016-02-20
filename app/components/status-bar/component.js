import E from 'ember';

export default E.Component.extend({
  audio: E.inject.service(),
  network: E.inject.service()
});
