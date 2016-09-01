const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

const ivectorsPath = `${process.cwd()}/ivectors`;

const clearProject = () => {
  const clean = [
    `${ivectorsPath}/prm`,
    `${ivectorsPath}/lbl`,
    `${ivectorsPath}/iv`,
    `${ivectorsPath}/gmm`,
    `${ivectorsPath}/mat`
  ];

  return BluebirdPromise.map(clean, item => fs.removeAsync(item));
};

const createProject = () => {
  const folders = [
    `${ivectorsPath}/prm`,
    `${ivectorsPath}/lbl`,
    `${ivectorsPath}/gmm`,
    `${ivectorsPath}/mat`,
    `${ivectorsPath}/iv/raw`,
    `${ivectorsPath}/iv/lengthNorm`
  ];

  return BluebirdPromise.map(folders, item => fs.mkdirsAsync(item));
};

module.exports = {
  clearProject,
  createProject
};
