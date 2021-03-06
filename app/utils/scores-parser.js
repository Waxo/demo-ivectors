const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

const parse = filePath => fs.readFileAsync(filePath)
  .then(read => {
    read = read.toString().split('\n');
    read = read.map(line => {
      if (line) {
        line = line.split(' ');
        return [line[1], line[4]];
      }
      return undefined;
    });
    return read.sort((a, b) => b[1] - a[1]).slice(0, read.length - 1);
  })
  .catch(() => false);

export default parse;
