import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('cluster-manager-comp', 'Integration | Component | cluster manager comp', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{cluster-manager-comp}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#cluster-manager-comp}}
      template block text
    {{/cluster-manager-comp}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
