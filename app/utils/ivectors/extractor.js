import execAsync from '../exec-async';
import logger from '../logger';

const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/bin`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

const extractIV = ndxFile => {
  logger.log('silly', 'extractIV');

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
  logger.log('silly', 'extractSoundIV');

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

export {extractIV, extractSoundIV};
