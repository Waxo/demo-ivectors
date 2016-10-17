import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learn-ivectors-comp', 'Integration | Component | learn ivectors comp', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learn-ivectors-comp}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learn-ivectors-comp}}
      template block text
    {{/learn-ivectors-comp}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
