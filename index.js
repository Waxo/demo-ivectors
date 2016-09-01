require('dotenv').config();
// const liv = require('./src/learn-ivectors');
//
// liv.learn();

const lm = require('./src/listen-mic');
const id = require('./src/ivectors-detect');

lm.start();
id.start();

setTimeout(() => {
  lm.stop();
  id.stop(true);
}, 300000);
