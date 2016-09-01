const cp = require('child_process');
const logger = require('./logger');

let mainProgram;

const start = () => {
  mainProgram = cp.spawn('./exe/arm-detection', ['--log', 'info', '--node']);

  mainProgram.stdout.on('data', d => {
    logger.log('debug', d.toString());
  });
};

const stop = () => {
  mainProgram.stdin.write('stop\n');
};

module.exports = {
  start,
  stop
};
