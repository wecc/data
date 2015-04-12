import {
  _bind,
  _guard,
  _objectIsAlive
} from "ember-data/system/store/common";

import {
  serializerForAdapter
} from "ember-data/system/store/serializers";

var get = Ember.get;
var Promise = Ember.RSVP.Promise;

var forEach = Ember.EnumerableUtils.forEach;
var map = Ember.EnumerableUtils.map;

function normalizeSerializerPayload(store, typeClass, payload) {
  console.log(typeClass.typeKey);
  var normalizedPayload = {
    meta: {},
    included: []
  };
  var typeKey = typeClass.typeKey || typeClass;

  if (Ember.isArray(payload)) {
    // old format, array
    normalizedPayload.data = [];
    forEach(payload, function(data) {
      data.type = data.type || typeKey;
      normalizedPayload.data.push(data);
    });
  } else {
    if (payload.data && payload.id === undefined) {
      // new format
      normalizedPayload = payload;
    } else {
      // old format, single
      payload.type = payload.type || typeKey;
      normalizedPayload.data = payload;
    }
  }

  normalizedPayload.meta = normalizedPayload.meta || {};
  normalizedPayload.included = normalizedPayload.included || {};

  return normalizedPayload;
}

function pushNormalizedSerializerPayload(store, typeClass, payload) {
  var result;

  if (Ember.isArray(payload.data)) {
    result = pushManyRecords(store, payload.data);
  } else {
    result = pushSingleRecord(store, payload.data);
  }

  // TODO: do metadata stuff

  pushManyRecords(store, payload.included);

  return result;
}

function pushManyRecords(store, data) {
  return map(data, function(data) {
    return pushSingleRecord(store, data);
  });
}

function pushSingleRecord(store, data) {
  return store.push(data.type, data);
}

export function _find(adapter, store, typeClass, id, record) {
  var snapshot = record._createSnapshot();
  var promise = adapter.find(store, typeClass, id, snapshot);
  var serializer = serializerForAdapter(store, adapter, typeClass);
  var label = "DS: Handle Adapter#find of " + typeClass + " with id: " + id;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    Ember.assert("You made a request for a " + typeClass.typeClassKey + " with id " + id + ", but the adapter's response did not have any data", adapterPayload);
    return store._adapterRun(function() {
      var payload = serializer.extract(store, typeClass, adapterPayload, id, 'find');

      var normalizedPayload = normalizeSerializerPayload(store, typeClass, payload);
      return pushNormalizedSerializerPayload(store, typeClass, normalizedPayload);
    });
  }, function(error) {
    record.notFound();
    if (get(record, 'isEmpty')) {
      store.unloadRecord(record);
    }

    throw error;
  }, "DS: Extract payload of '" + typeClass + "'");
}


export function _findMany(adapter, store, typeClass, ids, records) {
  var snapshots = Ember.A(records).invoke('_createSnapshot');
  var promise = adapter.findMany(store, typeClass, ids, snapshots);
  var serializer = serializerForAdapter(store, adapter, typeClass);
  var label = "DS: Handle Adapter#findMany of " + typeClass;

  if (promise === undefined) {
    throw new Error('adapter.findMany returned undefined, this was very likely a mistake');
  }

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    return store._adapterRun(function() {
      var payload = serializer.extract(store, typeClass, adapterPayload, null, 'findMany');

      Ember.assert("The response from a findMany must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

      var normalizedPayload = normalizeSerializerPayload(store, typeClass, payload);
      return pushNormalizedSerializerPayload(store, typeClass, normalizedPayload);
    });
  }, null, "DS: Extract payload of " + typeClass);
}

export function _findHasMany(adapter, store, record, link, relationship) {
  var snapshot = record._createSnapshot();
  var promise = adapter.findHasMany(store, snapshot, link, relationship);
  var serializer = serializerForAdapter(store, adapter, relationship.type);
  var label = "DS: Handle Adapter#findHasMany of " + record + " : " + relationship.type;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));
  promise = _guard(promise, _bind(_objectIsAlive, record));

  return promise.then(function(adapterPayload) {
    return store._adapterRun(function() {
      var payload = serializer.extract(store, relationship.type, adapterPayload, null, 'findHasMany');

      Ember.assert("The response from a findHasMany must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

      var typeKey = relationship.type.typeKey || relationship.type;
      var normalizedPayload = normalizeSerializerPayload(store, typeKey, payload);
      return pushNormalizedSerializerPayload(store, typeKey, normalizedPayload);
    });
  }, null, "DS: Extract payload of " + record + " : hasMany " + relationship.type);
}

export function _findBelongsTo(adapter, store, record, link, relationship) {
  var snapshot = record._createSnapshot();
  var promise = adapter.findBelongsTo(store, snapshot, link, relationship);
  var serializer = serializerForAdapter(store, adapter, relationship.type);
  var label = "DS: Handle Adapter#findBelongsTo of " + record + " : " + relationship.type;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));
  promise = _guard(promise, _bind(_objectIsAlive, record));

  return promise.then(function(adapterPayload) {
    return store._adapterRun(function() {
      var payload = serializer.extract(store, relationship.type, adapterPayload, null, 'findBelongsTo');

      if (!payload) {
        return null;
      }

      var typeKey = relationship.type.typeKey || relationship.type;
      var normalizedPayload = normalizeSerializerPayload(store, typeKey, payload);
      return pushNormalizedSerializerPayload(store, typeKey, normalizedPayload);

      //var record = store.push(relationship.type, payload);
      //return record;
    });
  }, null, "DS: Extract payload of " + record + " : " + relationship.type);
}

export function _findAll(adapter, store, typeClass, sinceToken) {
  var promise = adapter.findAll(store, typeClass, sinceToken);
  var serializer = serializerForAdapter(store, adapter, typeClass);
  var label = "DS: Handle Adapter#findAll of " + typeClass;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    store._adapterRun(function() {
      var payload = serializer.extract(store, typeClass, adapterPayload, null, 'findAll');

      Ember.assert("The response from a findAll must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

      var normalizedPayload = normalizeSerializerPayload(store, typeClass, payload);
      return pushNormalizedSerializerPayload(store, typeClass, normalizedPayload);
    });

    store.didUpdateAll(typeClass);
    return store.all(typeClass);
  }, null, "DS: Extract payload of findAll " + typeClass);
}

export function _findQuery(adapter, store, typeClass, query, recordArray) {
  var promise = adapter.findQuery(store, typeClass, query, recordArray);
  var serializer = serializerForAdapter(store, adapter, typeClass);
  var label = "DS: Handle Adapter#findQuery of " + typeClass;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    var payload;
    store._adapterRun(function() {
      payload = serializer.extract(store, typeClass, adapterPayload, null, 'findQuery');

      Ember.assert("The response from a findQuery must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');
    });

    recordArray.load(payload);
    return recordArray;

  }, null, "DS: Extract payload of findQuery " + typeClass);
}
