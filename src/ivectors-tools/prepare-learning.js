const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));
const wavFileInfo = BluebirdPromise.promisifyAll(require('wav-file-info'));
const logger = require('../logger');
const {execAsync} = require('../exec-async');

const ivPath = `${process.cwd()}/ivectors`;
const exePath = `${process.cwd()}/exe`;
const ivCfgPath = `${process.cwd()}/cfg-ivectors`;

const normPRM_ = () => {
  logger.log('silly', 'normPRM');
  const enerNorm = [
    `${exePath}/01_NormFeat`,
    `--config ${ivCfgPath}/00_PRM_NormFeat_energy.cfg`,
    `--inputFeatureFilename ${ivPath}/data.lst`,
    `--featureFilesPath ${ivPath}/prm/`,
    `--labelFilesPath ${ivPath}/lbl/`
  ];

  const featNorm = [
    `${exePath}/01_NormFeat`,
    `--config ${ivCfgPath}/01_PRM_NormFeat.cfg`,
    `--inputFeatureFilename ${ivPath}/data.lst`,
    `--featureFilesPath ${ivPath}/prm/`,
    `--labelFilesPath ${ivPath}/lbl/`
  ];

  return execAsync(enerNorm.join(' '))
    .then(() => execAsync(featNorm.join(' ')));
};

const prepareLearning = () => {
  const clusters = [];
  return fs.readdirAsync(`${process.cwd()}/input`)
    .then(dirs => {
      return BluebirdPromise.map(dirs,
        dir => {
          clusters.push([dir, []]);
          return fs.readdirAsync(`${process.cwd()}/input/${dir}`);
        });
    })
    .then(filesInDirs => {
      filesInDirs.forEach((fileList, index) => {
        clusters[index][1] = fileList;
      });
      return BluebirdPromise.map(clusters,
        cluster => BluebirdPromise.map(cluster[1], file => {
          const command = [
            `${exePath}/00_sfbcep`,
            '-F PCM16 -p 19 -e -D -A',
            `${process.cwd()}/input/${cluster[0]}/${file}`,
            `${ivPath}/prm/${file.replace('wav', 'prm')}`
          ];

          return execAsync(command.join(' '))
            .then(() => wavFileInfo.infoByFilenameAsync(
              `${process.cwd()}/input/${cluster[0]}/${file}`))
            .then(info => fs.writeFileAsync(
              `${ivPath}/lbl/${file.replace('wav', 'lbl')}`,
              `0 ${info.duration} sound`));
        })
      );
    })
    .then(() => fs.writeFileAsync(`${process.cwd()}/ivectors/data.lst`,
      clusters.map(f => f[1].join('\n').replace(/\.wav/g, '')).join('\n')))
    .then(() => {
      const ivExtractor = [];
      let ivExtractorMat = [];
      const Plda = [];
      let ivTest = '<replace>';
      clusters.forEach((cluster, idx) => {
        ivExtractorMat = ivExtractorMat.concat(cluster[1]);
        ivExtractor[idx] =
          `${cluster[0]} ${cluster[1].join(' ').replace(/\.wav/g, '')}`;
        Plda[idx] = cluster[1].join(' ').replace(/\.wav/g, '');
        ivTest += ` ${cluster[0]}`;
      });
      return fs.writeFileAsync(`${ivPath}/ivExtractorMat.ndx`,
        ivExtractorMat.map(c => {
          c = c.replace('.wav', '');
          return `${c} ${c}`;
        }).join('\n'))
        .then(() => fs.writeFileAsync(`${ivPath}/ivExtractor.ndx`,
          ivExtractor.join('\n')))
        .then(() => fs.writeFileAsync(`${ivPath}/Plda.ndx`,
          Plda.join('\n')))
        .then(() => fs.writeFileAsync(`${ivPath}/ivTest.ndx`, ivTest))
        .then(() => fs.writeFileAsync(`${ivPath}/ivTestMat.ndx`,
          `<replace> ${ivExtractorMat.join(' ').replace(/\.wav/g, '')}`))
        .then(() => fs.copyAsync(`${ivPath}/data.lst`, `${ivPath}/tv.ndx`));
    })
    .then(() => fs.copyAsync(`${ivPath}/ivExtractorMat.ndx`,
      `${ivPath}/TrainModel.ndx`))
    .then(() => fs.readFileAsync(`${ivPath}/ivExtractor.ndx`))
    .then(buffer => fs.appendFileAsync(`${ivPath}/TrainModel.ndx`,
      '\n' + buffer.toString())) // eslint-disable-line prefer-template
    .delay(10000)
    .then(() => normPRM_());
};

module.exports = prepareLearning;
