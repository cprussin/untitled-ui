import E from 'ember';

export default function destroyApp(application) {
  E.run(application, 'destroy');
}
