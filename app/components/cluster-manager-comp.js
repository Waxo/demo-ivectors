// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';
import logger from '../utils/logger';
import execAsync from '../utils/exec-async';
import {extractSoundIV} from '../utils/ivectors/extractor';
import {
  normalizeSound,
  scoreSph,
  scorePLDA
} from '../utils/ivectors/normalize-and-score';
import parse from '../utils/scores-parser';
import pad from '../utils/pad';

const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));
const wavFileInfo = BluebirdPromise.promisifyAll(require('wav-file-info'));

const detectedPath = `${process.cwd()}/DetectedWav`;
const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/bin`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

let fileNumber = 0;

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
  const [, ext] = filename.split('.');
  if (ext === 'json') {
    fs.remove(`${detectedPath}/${filename}`);
    return new BluebirdPromise((resolve, reject) => reject());
  } else if (ext === 'wav') {
    const file = `${pad(fileNumber++, 5)}.wav`;
    return fs.moveAsync(`${detectedPath}/${filename}`,
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
        return new BluebirdPromise(resolve => {
          resolve([arr[0][0][0], arr[1][0][0]]);
        });
      });
  }
};

export default Ember.Component.extend({
  lastDetection: '',
  clusters: [],
  init() {
    this._super(...arguments);
    fs.readdirAsync('./input')
      .then(clusters => this.set('clusters', clusters));
    fs.removeAsync(`${ivPath}/tmp`)
      .then(() => fs.mkdirsAsync(`${ivPath}/tmp/plda`))
      .then(() => fs.mkdirsAsync(`${ivPath}/tmp/sph`))
      .then(() => {
        fs.watch(detectedPath, (event, filename) => {
          if (event === 'change') {
            processFile(filename)
              .then(
                ([clusterSph, clusterPLDA]) => {
                  this.set('lastDetection', clusterSph);
                  if (clusterSph !== clusterPLDA) {
                    setTimeout(() => this.set('lastDetection', clusterPLDA),
                      200);
                  }
                })
              .catch(() => {});
          }
        });
      });
  }
});
