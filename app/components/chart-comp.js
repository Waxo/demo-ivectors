// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

const cp = require('child_process');
const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

const nbPts = 250;
const charts = {
  sound: [],
  start: [],
  stop: []
};

const capitalize = ([first, ...rest]) => first.toUpperCase() +
rest.join('').toLowerCase();

export default Ember.Component.extend({

  dynamicChart: Ember.inject.service('dynamic-chart'),

  chartOptions: {
    chart: {
      type: 'line',
      animation: false
    },
    title: {
      text: 'Direct Sound'
    },
    xAxis: {
      type: 'linear',
      title: {
        text: 'Time'
      },
      min: 0,
      max: nbPts
    },
    yAxis: {
      title: {
        text: 'Energy'
      },
      // minRange: 20
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    }
  },
  chartData: Ember.copy(
    [
      {name: 'Sound', data: charts.sound},
      {name: 'Start', data: charts.start},
      {name: 'Stop', data: charts.stop}
    ], true),
  init() {
    this._super(...arguments);
    let lastDate;

    BluebirdPromise.all([
      fs.removeAsync('./arm-detection.log'),
      fs.removeAsync('./arm-detection-node.log')
    ]);

    fs.watch('./', (ev, filename) => {
      if (ev === 'rename' && filename === 'arm-detection-node.log') {
        charts.sound.splice(0, charts.sound.length);
        charts.start.splice(0, charts.start.length);
        charts.stop.splice(0, charts.stop.length);
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
              charts.sound.push(lineSplit[1] * 10000);
              charts.start.push(lineSplit[2] * 10000);
              charts.stop.push(lineSplit[3] * 10000);

              if (charts.sound.length >= nbPts) {
                charts.sound.shift();
                charts.start.shift();
                charts.stop.shift();
              }
              const newData = [];
              for (let name in charts) {
                newData.push({
                  name: capitalize(name),
                  data: charts[name].slice(0, charts[data.length])
                });
              }

              this.set('chartData', newData);
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
