const logger = require('../logger');
const execAsync = require('../exec-async').execAsync;

const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/exe`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

const createUBM = () => {
  logger.log('silly', 'createUBM');

  const ubm = [
    `${exePath}/02_TrainWorld`,
    `--config ${ivCfgPath}/02_UBM_TrainWorld.cfg`,
    `--inputFeatureFilename ${ivPath}/data.lst`,
    `--featureFilesPath ${ivPath}/prm/`,
    `--labelFilesPath ${ivPath}/lbl/`,
    `--mixtureFilesPath ${ivPath}/gmm/`
  ];

  return execAsync(ubm.join(' '));
};

const createTV = () => {
  logger.log('silly', 'createTV');

  const tv = [
    `${exePath}/03_TotalVariability`,
    `--config ${ivCfgPath}/03_TV_TotalVariability_fast.cfg`,
    `--featureFilesPath ${ivPath}/prm/`,
    `--labelFilesPath ${ivPath}/lbl/`,
    `--mixtureFilesPath ${ivPath}/gmm/`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--ndxFilename ${ivPath}/tv.ndx`
  ];

  return execAsync(tv.join(' '));
};

module.exports = {createUBM, createTV};
