const logger = require('../logger');
const {execAsync} = require('../exec-async');

const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/exe`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

const extractIV = ndxFile => {
  logger.log('silly', 'ivectorExtractor');

  const ivExtractor = [
    `${exePath}/04_IvExtractor`,
    `--config ${ivCfgPath}/04_ivExtractor_fast.cfg`,
    `--featureFilesPath ${ivPath}/prm/`,
    `--labelFilesPath ${ivPath}/lbl/`,
    `--mixtureFilesPath ${ivPath}/gmm/`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--saveVectorFilesPath ${ivPath}/iv/raw/`,
    `--targetIdList ${ivPath}/${ndxFile}`
  ];

  return execAsync(ivExtractor.join(' '));
};

const extractSoundIV = ndxFile => {
  logger.log('silly', 'ivectorExtractor');

  const ivExtractor = [
    `${exePath}/04_IvExtractor`,
    `--config ${ivCfgPath}/04_ivExtractor_fast.cfg`,
    `--featureFilesPath ${ivPath}/tmp/`,
    `--labelFilesPath ${ivPath}/tmp/`,
    `--mixtureFilesPath ${ivPath}/gmm/`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--saveVectorFilesPath ${ivPath}/iv/raw/`,
    `--targetIdList ${ivPath}/tmp/${ndxFile}`
  ];

  return execAsync(ivExtractor.join(' '));
};

module.exports = {extractIV, extractSoundIV};
