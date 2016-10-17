import {clearProject, createProject} from './ivectors/project-cleaner';
import prepareLearning from './ivectors/prepare-learning';
import {createUBM, createTV} from './ivectors/ubm-tv';
import {extractIV} from './ivectors/extractor';
import {normalize, createSph} from './ivectors/normalize-and-score';

const learn = () => {
  const allNorm = false;
  return clearProject()
    .then(() => createProject())
    .then(() => prepareLearning())
    .then(() => createUBM())
    .then(() => createTV())
    .then(() => extractIV('ivExtractorMat.ndx'))
    .then(() => extractIV('ivExtractor.ndx'))
    .then(() => normalize())
    .then(() => createSph(allNorm));
};

export default learn;
