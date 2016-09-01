const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));
const {execAsync} = require('../exec-async');

const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/exe`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

const normalize = () => {
  return fs.readdirAsync(`${ivPath}/iv/raw`)
    .then(ivectors => fs.writeFileAsync(`${ivPath}/all.lst`,
      ivectors.join('\n').replace(/\.y/g, '')))
    .then(() => {
      const normPLDA = [
        `${exePath}/05_1_IvNorm`,
        `--config ${ivCfgPath}/05_1_PLDA_ivNorm.cfg`,
        `--saveVectorFilesPath ${ivPath}/iv/lengthNorm/`,
        `--loadVectorFilesPath ${ivPath}/iv/raw/`,
        `--matrixFilesPath ${ivPath}/mat/`,
        `--backgroundNdxFilename ${ivPath}/Plda.ndx`,
        `--inputVectorFilename ${ivPath}/all.lst`
      ];

      return execAsync(normPLDA.join(' '));
    });
};

const normalizeSound = (file) => {
  const normPLDA = [
    `${exePath}/05_1_IvNorm`,
    `--config ${ivCfgPath}/05_1_PLDA_ivNorm.cfg`,
    `--saveVectorFilesPath ${ivPath}/iv/lengthNorm/`,
    `--loadVectorFilesPath ${ivPath}/iv/raw/`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--backgroundNdxFilename ${ivPath}/Plda.ndx`,
    `--inputVectorFilename ${ivPath}/tmp/${file}`
  ];

  return execAsync(normPLDA.join(' '));
};

const scoring_ = cfg => {
  const outputName = `${cfg.name}.txt`;
  const outDir = (cfg.output) ? `${ivPath}/${cfg.output}/${outputName}` :
    '/dev/null';

  const score = [
    `${exePath}/06_IvTest`,
    `--config ${ivCfgPath}/${cfg.configFile}`,
    `--testVectorFilesPath ${ivPath}/iv/${cfg.norm ? 'lengthNorm' : 'raw'}`,
    `--loadVectorFilesPath ${ivPath}/iv/${cfg.norm ? 'lengthNorm' : 'raw'}`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--outputFilename ${outDir}`,
    `--backgroundNdxFilename ${ivPath}/Plda.ndx`,
    `--targetIdList ${ivPath}/TrainModel.ndx`,
    `--ndxFilename ${ivPath}/${cfg.ndxFile}`
  ];

  return execAsync(score.join(' '));
};

const createSph = (name, norm = false) => {
  let firstFile = '';
  return fs.readdirAsync(`${process.cwd()}/input`)
    .then(dirs => fs.readdirAsync(`${process.cwd()}/input/${dirs[0]}`))
    .then(file => {
      firstFile = file[0];
      return fs.readFileAsync(`${ivPath}/ivTestMat.ndx`);
    })
    .then(read => fs.writeFileAsync(`${ivPath}/createMat.ndx`,
      read.toString().replace('<replace>', firstFile.replace('.wav', ''))))
    .then(() => scoring_({
      name,
      configFile: '08_sph_ivTest_SphNorm_Plda.cfg',
      output: false,
      ndxFile: 'createMat.ndx',
      norm
    }));
};

const scoreSph = (name, norm = false) => {
  return scoring_({
    name,
    configFile: '08_sph_ivTest_SphNorm_Plda_no_load.cfg',
    output: 'tmp/sph',
    ndxFile: `tmp/ivTest-${name}.ndx`,
    norm
  });
};

const trainPLDA = () => {
  const train = [
    `${exePath}/05_2_PLDA`,
    `--config ${ivCfgPath}/05_2_PLDA_Plda.cfg`,
    `--testVectorFilesPath ${ivPath}/iv/lengthNorm/`,
    `--loadVectorFilesPath ${ivPath}/iv/lengthNorm/`,
    `--matrixFilesPath ${ivPath}/mat/`,
    `--backgroundNdxFilename ${ivPath}/Plda.ndx`
  ];
  return execAsync(train.join(' '));
};


const scorePLDA = (name, norm = false) => {
  return trainPLDA()
    .then(() => scoring_({
      name,
      configFile: '05_3_PLDA_ivTest_Plda.cfg',
      output: 'tmp/plda',
      ndxFile: `tmp/ivTest-${name}.ndx`,
      norm
    }));
};

module.exports = {normalize, normalizeSound, createSph, scoreSph, scorePLDA};
