module('unit/serializers/json-api-serializer');

test('transformFor returns the appropriate transform', function () {
  expect(2);

  var booleanTransform = {};

  var serializer = DS.JSONAPISerializer.create({
    container: {
      lookup: function (name) {
        equal(name, 'transform:boolean');
        return booleanTransform;
      }
    }
  });

  var transform = serializer.transformFor('boolean');

  equal(transform, booleanTransform, 'transform is correct.');
});
