var env;
var run = Ember.run;

module('integration/serializer/json-api - JSONAPISerializer', {
  setup: function() {
    env = setupStore({
    });
  },

  teardown: function() {
    run(env.store, 'destroy');
  }
});

/*test('...', function() {

});*/
