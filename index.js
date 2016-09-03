require('dotenv').config();
const vorpal = require('vorpal')();
const logger = require('./src/logger');
const liv = require('./src/learn-ivectors');
const lm = require('./src/listen-mic');
const id = require('./src/ivectors-detect');

vorpal.delimiter('demo-IV>').show();

vorpal.command('learn', 'Learn the model inside input')
  .alias('l')
  .action((args, cb) => {
    logger.log('info', 'Learning models');
    liv.learn().then(() => logger.log('info', 'Learning Done !'));
    cb();
  });

vorpal.command('begin [time]', 'Begin listening, and classifying')
  .alias('b')
  .action((args, cb) => {
    logger.log('info', 'Listening direct input');
    lm.start();
    id.start();
    if (args.time) {
      logger.log('info', `Listening will stop after ${args.time}ms`);
      setTimeout(() => {
        logger.log('info', 'Stopping listening');
        lm.stop();
        setTimeout(id.stop, 1000);
      }, args.time);
    }
    cb();
  });

vorpal.command('Stop', 'Stop listening and classifying')
  .alias('s')
  .action((args, cb) => {
    logger.log('info', 'Stopping listening');
    lm.stop();
    setTimeout(() => {
      id.stop();
      cb();
    }, 1000);
  });
