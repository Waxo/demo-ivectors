// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';
import learn from '../utils/learn';

export default Ember.Component.extend({
  canLearn: false,
  isLearning: false,
  isDone: false,
  actions: {
    startLearning() {
      this.set('isLearning', true);
      learn().then(() => {
        this.set('isLearning', false);
        this.set('isDone', true);
      });
    }
  }
});
