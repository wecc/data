/**
  @module ember-data
*/

import Serializer from "ember-data/system/serializer";

var copy = Ember.copy;
var get = Ember.get;
var forEach = Ember.ArrayPolyfills.forEach;
var map = Ember.ArrayPolyfills.map;

/**
  @class JSONAPISerializer
  @namespace DS
  @extends DS.Serializer
*/
export default Serializer.extend({

  keyForAttribute: function(key) {
    return Ember.String.dasherize(key);
  },

  keyForRelationship: function(key, kind) {
    return Ember.String.dasherize(key);
  },

  normalizeTypeKey: function(typeKey) {
    return Ember.String.camelize(typeKey);
  },

  serializeTypeKey: function(typeKey) {
    return Ember.String.dasherize(typeKey);
  },



  extract: function(store, type, payload, id, requestType) {
    if (!payload.data) { return; }

    var dataType = Ember.typeOf(payload.data);

    if (dataType === 'object') {
      return this.extractSingle(store, payload, id);
    } else if (dataType === 'array') {
      store.setMetadataFor(type, payload.meta || {});
      return this.extractArray(store, payload);
    }
  },

  extractSingle: function(store, payload, id) {
    var data;

    this.extractIncluded(store, payload.included);

    data = this.extractData(store, get(payload, 'data'));

    return data;
  },

  extractArray: function(store, payload) {
    var data;

    this.extractIncluded(store, payload.included);

    data = map.call(payload.data, function(item) {
      return this.extractData(store, item);
    }, this);

    return data;
  },

  extractData: function(store, data) {
    var type, typeName, typeSerializer;

    if (!data) { return; }

    typeName = this.normalizeTypeKey(data.type);

    Ember.assert('No model was found for model name "' + typeName + '"', store.modelFactoryFor(typeName));

    type = store.modelFor(typeName);
    typeSerializer = store.serializerFor(type);

    return typeSerializer.normalize(type, data);
  },

  extractIncluded: function(store, included) {
    var type, typeName, typeSerializer, hash;

    if (!included) { return; }

    forEach.call(included, function(data) {
      typeName = this.normalizeTypeKey(data.type);

      if (!store.modelFactoryFor(typeName)) {
        Ember.warn('No model was found for model name "' + typeName + '"', false);
        return;
      }

      type = store.modelFor(typeName);
      typeSerializer = store.serializerFor(type);

      hash = typeSerializer.normalize(type, data);
      store.push(typeName, hash);
    }, this);
  },



  serialize: function(snapshot, options) {
    var json = {};

    json['type'] = this.serializeTypeKey(snapshot.typeKey);

    if (options && options.includeId) {
      json['id'] = snapshot.id;
    }

    snapshot.eachAttribute(function(key, attribute) {
      this.serializeAttribute(snapshot, json, key, attribute);
    }, this);

    snapshot.eachRelationship(function(key, relationship) {
      if (relationship.kind === 'belongsTo') {
        this.serializeBelongsTo(snapshot, json, relationship);
      } else if (relationship.kind === 'hasMany') {
        this.serializeHasMany(snapshot, json, relationship);
      }
    }, this);

    json = { data: json };

    return json;
  },

  serializeAttribute: function(snapshot, json, key, attribute) {
    var value = snapshot.attr(key);
    var type = attribute.type;

    if (type) {
      var transform = this.transformFor(type);
      value = transform.serialize(value);
    }

    var payloadKey = this.keyForAttribute(key);
    json[payloadKey] = value;
  },

  serializeBelongsTo: function(snapshot, json, relationship) {
    var key = relationship.key;
    var belongsTo = snapshot.belongsTo(key);

    var links = json['links'] = json['links'] || {};

    var payloadKey = this.keyForRelationship(key, 'belongsTo');

    if (Ember.isNone(belongsTo)) {
      links[payloadKey] = { id: null };
    } else {
      links[payloadKey] = {
        type: this.serializeTypeKey(belongsTo.typeKey),
        id: belongsTo.id
      };
    }
  },

  serializeHasMany: function(snapshot, json, relationship) {
    var key = relationship.key;
    var hasMany = snapshot.hasMany(key);

    var links = json['links'] = json['links'] || {};

    var payloadKey = this.keyForRelationship(key, 'hasMany');

    if (hasMany.length === 0) {
      links[payloadKey] = { ids: [] };
    } else {

      // TODO: if all items in hasMany is of the same type, provide
      // { type: "type", ids: [..] } instead of { data: [...] }

      var data = [];
      for (var i = 0; i < hasMany.length; i++) {
        data.push({
          type: this.serializeTypeKey(hasMany[i].typeKey),
          id: hasMany[i].id
        });
      }
      links[payloadKey] = { data: data };
    }
  },



  normalize: function(type, data) {
    var hash = copy(data);

    this.normalizeAttributes(type, hash);
    this.normalizeRelationships(type, hash);
    this.normalizeLinks(hash);
    this.applyTransforms(type, hash);

    return hash;
  },

  normalizeAttributes: function(type, hash) {
    var payloadKey;

    type.eachAttribute(function(key) {
      payloadKey = this.keyForAttribute(key);

      if (key === payloadKey) { return; }
      if (!hash.hasOwnProperty(payloadKey)) { return; }

      hash[key] = hash[payloadKey];
      delete hash[payloadKey];
    }, this);
  },

  normalizeRelationships: function(type, hash) {
    var payloadKey, link;

    if (!hash.links) { return; }

    type.eachRelationship(function(key, relationship) {
      payloadKey = this.keyForRelationship(key, relationship.kind);

      if (hash.links[payloadKey]) {
        link = hash.links[payloadKey];

        if (relationship.kind === 'belongsTo' && link.id) {

          hash[key] = { id: link.id, type: this.normalizeTypeKey(link.type) };
          delete hash.links[payloadKey];

        } else if (relationship.kind === 'hasMany') {

          if (link.ids) {

            hash[key] = map.call(link.ids, function(id) {
              return { id: id, type: this.normalizeTypeKey(link.type) };
            }, this);
            delete hash.links[payloadKey];

          } else if (link.data) {

            hash[key] = map.call(link.data, function(item) {
              return { id: item.id, type: this.normalizeTypeKey(item.type) };
            }, this);
            delete hash.links[payloadKey];

          }
        }
      }
    }, this);
  },

  normalizeLinks: function(hash) {
    var links = hash.links;

    if (!links) { return; }

    for (var key in links) {
      links[key] = this.normalizeLink(links[key]);
    }
  },

  normalizeLink: function(link) {
    var normalizedLink = {};

    if (Ember.typeOf(link) === 'string') {
      normalizedLink = {
        self: null,
        resource: link
      };
    } else {
      normalizedLink = {
        self: link.self || null,
        resource: link.resource || null
      };
    }

    return normalizedLink;
  },

  applyTransforms: function(type, hash) {
    type.eachTransformedAttribute(function applyTransform(key, type) {
      if (!hash.hasOwnProperty(key)) { return; }

      var transform = this.transformFor(type);
      hash[key] = transform.deserialize(hash[key]);
    }, this);
  }
});
