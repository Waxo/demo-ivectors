// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

const cp = require('child_process');
const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

const nbPts = 1000;
const sound = [];

export default Ember.Component.extend({

  dynamicChart: Ember.inject.service('dynamic-chart'),

  chartOptions: {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Direct Sound'
    },
    xAxis: {
      type: 'category',
      title: {
        text: 'Time'
      },
      min: 0,
      max: nbPts
    },
    yAxis: {
      title: {
        text: 'Energy'
      }
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    }
  },
  chartData: Ember.copy([{name: 'Sound', data: sound}], true),
  init() {
    this._super(...arguments);
    let lastDate;

    BluebirdPromise.all([
      fs.removeAsync('./arm-detection.log'),
      fs.removeAsync('./arm-detection-node.log')
    ]);

    fs.watch('./', (ev, filename) => {
      if (ev === 'rename' && filename === 'arm-detection-node.log') {
        sound.splice(0, sound.length);
        const graphInfo = cp.spawn('tail', ['-f', './arm-detection-node.log']);

        graphInfo.stdout.on('data', d => {
          const data = d.toString();
          // eslint-disable-next-line no-control-regex
          const regNewline = new RegExp('\n', 'g');
          const lines = data.split(regNewline);

          lines.forEach(line => {
            const regSharp = new RegExp('#', 'g');
            const lineSplit = line.split(regSharp);
            if (line.indexOf('graph#') >= 0) {
              sound.push(lineSplit[1] * 10000);
              if (sound.length > 3 * nbPts) {
                sound.splice(0, Math.floor(nbPts * 1.5));
              }
              const newChartData = this.get('dynamicChart')
                .updateSeriesData([{name: 'Sound', data: sound}],
                  (sound.length > nbPts) ? sound.length - nbPts : 0,
                  sound.length);
              this.set('chartData', newChartData);
            }
          });
        });

        lastDate = new Date();
        const interv = setInterval(() => {
          if (new Date() - lastDate > 3000) {
            clearInterval(interv);
            graphInfo.kill('SIGTERM');
            return BluebirdPromise.all([
              fs.removeAsync('./arm-detection.log'),
              fs.removeAsync('./arm-detection-node.log')
            ]).then(() => console.log('Curve stopped'));
          }
        }, 1000);
      }
      if (ev === 'change' && filename === 'arm-detection-node.log') {
        lastDate = new Date();
      }
    });
  }
});
