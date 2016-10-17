// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

const BluebirdPromise = require('bluebird');
const fs = BluebirdPromise.promisifyAll(require('fs-extra'));

const defaultOpacity = 0.3;

export default Ember.Component.extend({
  tagName: '',
  image: 'img/sample-icon.png',
  opacity: defaultOpacity,
  inlineStyle: Ember.computed('opacity', function () {
    // eslint-disable-next-line new-cap
    return new Ember.String.htmlSafe(`opacity: ${this.get('opacity')}`);
  }),
  init() {
    this._super(...arguments);
    fs.readdirAsync('public/img')
      .then(images => {
        const img = images.map(i => i.split('.')[0]);
        if (img.indexOf(this.get('clusterName')) >= 0) {
          this.set('image',
            `img/${images[img.indexOf(this.get('clusterName'))]}`);
        }
      });
  },
  didUpdateAttrs() {
    this._super(...arguments);
    if (this.get('lastDetection') === this.get('clusterName')) {
      this.set('opacity', 1);
      setTimeout(() => this.set('opacity', defaultOpacity), 2000);
    }
  }
});
