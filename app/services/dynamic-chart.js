// eslint-disable-next-line import/no-extraneous-dependencies
import Ember from 'ember';

export default Ember.Service.extend({
  updateSeriesData(chartData, rangeStart, rangeEnd) {
    return chartData.map(series => {
      return {
        name: series.name,
        data: series.data.slice(rangeStart, rangeEnd)
      };
    });
  }
});
