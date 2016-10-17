// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

const cp = require('child_process');

let mainProgram = null;

export default Ember.Component.extend({
  isStarted: false,
  actions: {
    startListening() {
      if (!this.get('isStarted')) {
        this.set('isStarted', true);
        mainProgram =
          cp.spawn('./bin/arm-detection', ['-log', 'info', '--node']);
        mainProgram.stdout.on('data', d => console.log(d.toString()));
      }
    },
    stopListening() {
      if (this.get('isStarted')) {
        this.set('isStarted', false);
        mainProgram.stdin.write('stop\n');
      }
    }
  }
});
