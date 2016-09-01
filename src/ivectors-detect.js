const EventEmitter = require('events');
const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));
const wavFileInfo = BluebirdPromise.promisifyAll(require('wav-file-info'));
const logger = require('./logger');
const {pad} = require('./pad');
const {execAsync} = require('./exec-async');
const {extractSoundIV} = require('./ivectors-tools/extract-ivectors');
const {
  normalizeSound,
  scoreSph,
  scorePLDA
} = require('./ivectors-tools/normalize-and-score');
const {parse} = require('./ivectors-tools/scores-parser');


class MyEmitter extends EventEmitter {
}
const ev = new MyEmitter();

let fileNumber = 0;

const detectedPath = `${process.cwd()}/DetectedWav`;
const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/exe`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

let watcher;

const start = () => {
  fs.removeAsync(`${ivPath}/tmp`)
    .then(() => fs.mkdirsAsync(`${ivPath}/tmp/plda`))
    .then(() => fs.mkdirsAsync(`${ivPath}/tmp/sph`))
    .then(() => {
      watcher = fs.watch(detectedPath, (event, filename) => {
        if (event === 'change') {
          ev.emit('new detect', filename);
        }
      });
    });
};

const stop = (clean = false) => {
  watcher.close();
  const files = [`${ivPath}/tmp`];
  for (let i = 0; i < fileNumber; i++) {
    files.push(`${ivPath}/iv/raw/${pad(i, 5)}.y`);
    files.push(`${ivPath}/iv/lengthNorm/${pad(i, 5)}.y`);
  }
  if (clean) {
    files.map(file => fs.remove(file));
  }
};

const normPRMFile_ = file => {
  logger.log('silly', 'normPRM');
  const enerNorm = [
    `${exePath}/01_NormFeat`,
    `--config ${ivCfgPath}/00_PRM_NormFeat_energy.cfg`,
    `--inputFeatureFilename ${ivPath}/tmp/${file}.lst`,
    `--featureFilesPath ${ivPath}/tmp/`,
    `--labelFilesPath ${ivPath}/tmp/`
  ];

  const featNorm = [
    `${exePath}/01_NormFeat`,
    `--config ${ivCfgPath}/01_PRM_NormFeat.cfg`,
    `--inputFeatureFilename ${ivPath}/tmp/${file}.lst`,
    `--featureFilesPath ${ivPath}/tmp/`,
    `--labelFilesPath ${ivPath}/tmp/`
  ];

  return execAsync(enerNorm.join(' '))
    .then(() => execAsync(featNorm.join(' ')));
};

const processFile = filename => {
  const start = new Date();
  const [,ext] = filename.split('.');
  if (ext === 'json') {
    fs.remove(`${detectedPath}/${filename}`);
  } else if (ext === 'wav') {
    const file = `${pad(fileNumber++, 5)}.wav`;
    logger.log('info', `New Detection : ${file}`);
    fs.moveAsync(`${detectedPath}/${filename}`,
      `${ivPath}/tmp/${file}`)
      .then(() => {
        const command = [
          `${exePath}/00_sfbcep`,
          '-F PCM16 -p 19 -e -D -A',
          `${ivPath}/tmp/${file}`,
          `${ivPath}/tmp/${file.replace('wav', 'prm')}`
        ];

        return execAsync(command.join(' '))
          .then(() => wavFileInfo.infoByFilenameAsync(
            `${ivPath}/tmp/${file}`))
          .then(info => fs.writeFileAsync(
            `${ivPath}/tmp/${file.replace('wav', 'lbl')}`,
            `0 ${info.duration} sound`));
      })
      .then(
        () => fs.writeFileAsync(`${ivPath}/tmp/${file.replace('wav', 'lst')}`,
          file.replace('.wav', '')))
      .then(
        () => fs.writeFileAsync(`${ivPath}/tmp/${file.replace('wav', 'ndx')}`,
          `${file.replace('.wav', '')} ${file.replace('.wav', '')}`))
      .then(() => fs.readFileAsync(`${ivPath}/ivTest.ndx`))
      .then(read => fs.writeFileAsync(
        `${ivPath}/tmp/ivTest-${file.replace('wav', 'ndx')}`,
        read.toString().replace('<replace>', file.replace('.wav', ''))))
      .then(() => normPRMFile_(file.replace('.wav', '')))
      .then(() => extractSoundIV(file.replace('wav', 'ndx')))
      .then(() => normalizeSound(file.replace('wav', 'lst')))
      .then(() => BluebirdPromise.all([scoreSph(file.replace('.wav', '')),
        scorePLDA(file.replace('.wav', ''))]))
      .then(() => BluebirdPromise.all(
        [parse(`${ivPath}/tmp/sph/${file.replace('wav', 'txt')}`),
          parse(`${ivPath}/tmp/plda/${file.replace('wav', 'txt')}`)]))
      .then(arr => {
        const duration = new Date() - start;
        const results = `${arr[0][0][0]} or ${arr[0][0][0]}`;
        logger.log('info', `${file} scored - ${results} (${duration}ms)`);
        logger.log('debug', arr[0]);
        logger.log('debug', arr[1]);
      });
  }
};

ev.on('new detect', processFile);

module.exports = {start, stop};
