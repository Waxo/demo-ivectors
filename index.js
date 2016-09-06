require('dotenv').config();
const vorpal = require('vorpal')();
const logger = require('./src/logger');
const liv = require('./src/learn-ivectors');
const ivCommands = require('./src/ivectors-commands');

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
    ivCommands.start()
      .then(msg => logger.log('info', msg))
      .catch(err => logger.log('warn', err))
      .finally(cb);
    if (args.time) {
      logger.log('info', `Listening will stop after ${args.time}ms`);
      setTimeout(() => {
        ivCommands.stop()
          .then(msg => logger.log('info', msg))
          .catch(err => logger.log('warn', err))
          .finally(cb);
      }, args.time);
    }
  });

vorpal.command('stop', 'Stop listening and classifying')
  .alias('s')
  .action((args, cb) => {
    ivCommands.stop()
      .then(msg => logger.log('info', msg))
      .catch(err => logger.log('warn', err))
      .finally(cb);
  });
