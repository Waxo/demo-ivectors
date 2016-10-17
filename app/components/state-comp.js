// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

const cp = require('child_process');
const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

export default Ember.Component.extend({
  isDetecting: false,
  init() {
    this._super(...arguments);
    let lastDate;
    fs.watch('./', (ev, filename) => {
      if (ev === 'rename' && filename === 'arm-detection-node.log') {
        const stateInfo = cp.spawn('tail', ['-f', './arm-detection-node.log']);

        stateInfo.stdout.on('data', d => {
          const data = d.toString();
          // eslint-disable-next-line no-control-regex
          const regNewline = new RegExp('\n', 'g');
          const lines = data.split(regNewline);

          lines.forEach(line => {
            const regSharp = new RegExp('#', 'g');
            const lineSplit = line.split(regSharp);
            if (line.indexOf('state#') >= 0) {
              if (lineSplit[1] === 'detecting') {
                this.set('isDetecting', true);
              } else {
                this.set('isDetecting', false);
              }
            }
          });
        });

        lastDate = new Date();
        const interv = setInterval(() => {
          if (new Date() - lastDate > 2000) {
            clearInterval(interv);
            stateInfo.kill('SIGTERM');
            this.set('isDetecting', false);
          }
        }, 1000);
      }

      if (ev === 'change' && filename === 'arm-detection-node.log') {
        lastDate = new Date();
      }
    });
  }
});
