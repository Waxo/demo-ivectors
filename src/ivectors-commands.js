const BluebirdPromise = require('bluebird');
const lm = require('./listen-mic');
const id = require('./ivectors-detect');

let isStarted = false;

const start = () => new BluebirdPromise((resolve, reject) => {
  if (isStarted) {
    reject('Listening is already started');
  } else {
    isStarted = true;
    lm.start();
    id.start();
    resolve('Listening direct input');
  }
});

const stop = () => new BluebirdPromise((resolve, reject) => {
  if (isStarted) {
    isStarted = false;
    lm.stop();
    setTimeout(() => {
      id.stop(true);
      resolve('Stopped listening direct input');
    });
  } else {
    reject('Not listening, please start it before');
  }
});

module.exports = {start, stop};
