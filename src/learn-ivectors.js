const logger = require('./logger');
const pc = require('./ivectors-tools/project-cleaner');
const prepareLearning = require('./ivectors-tools/prepare-learning');
const ubmTV = require('./ivectors-tools/ubm-tv');
const iv = require('./ivectors-tools/extract-ivectors');
const ns = require('./ivectors-tools/normalize-and-score');

const learn = () => {
  const allNorm = false;
  pc.clearProject()
    .then(() => pc.createProject())
    .then(() => prepareLearning())
    .then(() => ubmTV.createUBM())
    .then(() => ubmTV.createTV())
    .then(() => iv.extractIV('ivExtractorMat.ndx'))
    .then(() => iv.extractIV('ivExtractor.ndx'))
    .then(() => ns.normalize())
    .then(() => ns.createSph(allNorm))
    .then(() => logger.log('info', 'Learning Done !'));
};

module.exports = {learn};
