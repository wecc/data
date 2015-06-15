/**
  @module ember-data
*/

import coerceId from "ember-data/system/coerce-id";
import Serializer from 'ember-data/system/serializer';
import normalizeModelName from 'ember-data/system/normalize-model-name';
import { pluralize, singularize } from 'ember-inflector/lib/system/string';

const dasherize = Ember.String.dasherize;
const get = Ember.get;
const map = Ember.EnumerableUtils.map;
const merge = Ember.merge;

/**
  @class JSONAPISerializer
  @namespace DS
  @extends DS.Serializer
*/
export default Serializer.extend({

  /**
    @method keyForAttribute
    @param {String} key
    @param {String} method
    @return {String} normalized key
  */
  keyForAttribute: function(key, method) {
    return dasherize(key);
  },

  /**
    @method keyForRelationship
    @param {String} key
    @param {String} typeClass
    @param {String} method
    @return {String} normalized key
  */
  keyForRelationship: function(key, typeClass, method) {
    return dasherize(key);
  },

  /**
    @method modelNameFromPayloadKey
    @param {String} key
    @return {String} the model's modelName
  */
  modelNameFromPayloadKey: function(key) {
    return singularize(normalizeModelName(key));
  },

  /**
    @method payloadKeyFromModelName
    @param {String} modelName
    @return {String}
  */
  payloadKeyFromModelName: function(modelName) {
    return pluralize(modelName);
  },

  /*
   * NORMALIZATION
   */

  /*
    @method normalizeResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeResponse: function(store, primaryModelClass, payload, id, requestType) {
    switch (requestType) {
      case 'find':
        return this.normalizeFindResponse(...arguments);
      case 'findAll':
        return this.normalizeFindAllResponse(...arguments);
      case 'findBelongsTo':
        return this.normalizeFindBelongsToResponse(...arguments);
      case 'findHasMany':
        return this.normalizeFindHasManyResponse(...arguments);
      case 'findMany':
        return this.normalizeFindManyResponse(...arguments);
      case 'findQuery':
        return this.normalizeFindQueryResponse(...arguments);
      case 'createRecord':
        return this.normalizeCreateRecordResponse(...arguments);
      case 'deleteRecord':
        return this.normalizeDeleteRecordResponse(...arguments);
      case 'updateRecord':
        return this.normalizeUpdateRecordResponse(...arguments);
    }
  },

  /*
    @method normalizeFindResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSingleResponse(...arguments);
  },

  /*
    @method normalizeFindAllResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindAllResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeArrayResponse(...arguments);
  },

  /*
    @method normalizeFindBelongsToResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindBelongsToResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSingleResponse(...arguments);
  },

  /*
    @method normalizeFindHasManyResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindHasManyResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeArrayResponse(...arguments);
  },

  /*
    @method normalizeFindManyResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindManyResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeArrayResponse(...arguments);
  },

  /*
    @method normalizeFindQueryResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeFindQueryResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeArrayResponse(...arguments);
  },

  /*
    @method normalizeCreateRecordResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeCreateRecordResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSaveResponse(...arguments);
  },

  /*
    @method normalizeDeleteRecordResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeDeleteRecordResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSaveResponse(...arguments);
  },

  /*
    @method normalizeUpdateRecordResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeUpdateRecordResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSaveResponse(...arguments);
  },

  /*
    @method normalizeSaveResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeSaveResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this.normalizeSingleResponse(...arguments);
  },

  /*
    @method normalizeSingleResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeSingleResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this._normalizeResponse(store, primaryModelClass, payload, id, requestType, 'single');
  },

  /*
    @method normalizeArrayResponse
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @return {Object} JSON-API Document
  */
  normalizeArrayResponse: function(store, primaryModelClass, payload, id, requestType) {
    return this._normalizeResponse(store, primaryModelClass, payload, id, requestType, 'array');
  },

  /**
    @method _normalizeResponse
    @private
    @param {DS.Store} store
    @param {DS.Model} primaryModelClass
    @param {Object} payload
    @param {String|Number} id
    @param {String} requestType
    @param {String} variant 'single' or 'array'
    @return {Object} JSON-API Document
  */
  _normalizeResponse: function(store, primaryModelClass, payload, id, requestType, variant) {

    if (Ember.typeOf(payload.data) === 'object') {
      payload.data = this._normalizeResourceHelper(payload.data);
    } else if (Ember.typeOf(payload.data) === 'array') {
      payload.data = map(payload.data, this._normalizeResourceHelper, this);
    }

    if (Ember.typeOf(payload.included) === 'array') {
      payload.included = map(payload.included, this._normalizeResourceHelper, this);
    }

    return payload;
  },

  /*
    @method _normalizeResourceHelper
    @private
    @param {Object} resourceHash
    @return {Object}
  */
  _normalizeResourceHelper: function(resourceHash) {
    let modelName = this.modelNameFromPayloadKey(resourceHash.type);
    let modelClass = this.store.modelFor(modelName);
    let serializer = this.store.serializerFor(modelName);
    let { data } = serializer.normalize(modelClass, resourceHash);
    return data;
  },

  /*
    @method normalize
    @param {DS.Model} modelClass
    @param {Object} resourceHash
    @return {String}
  */
  normalize: function(modelClass, resourceHash) {
    let data = null;

    if (resourceHash) {
      this.normalizeUsingDeclaredMapping(modelClass, resourceHash);

      data = {
        id:            this.extractId(resourceHash),
        type:          this.extractType(modelClass, resourceHash),
        attributes:    this.extractAttributes(modelClass, resourceHash),
        relationships: this.extractRelationships(modelClass, resourceHash)
      };

      this._applyTransforms(modelClass, data.attributes);
    }

    return { data };
  },

  /*
    @method extractId
    @param {Object} resourceHash
    @return {String}
  */
  extractId: function(resourceHash) {
    return coerceId(resourceHash.id);
  },

  /*
    @method extractType
    @param {DS.Model} modelClass
    @param {Object} resourceHash
    @return {String}
  */
  extractType: function(modelClass, resourceHash) {
    return this.modelNameFromPayloadKey(resourceHash.type);
  },

  /*
    @method extractAttributes
    @param {DS.Model} modelClass
    @param {Object} resourceHash
    @return {Object}
  */
  extractAttributes: function(modelClass, resourceHash) {
    var attributes = {};

    if (resourceHash.attributes) {
      modelClass.eachAttribute((key) => {
        let attributeKey = this.keyForAttribute(key, 'deserialize');
        if (resourceHash.attributes.hasOwnProperty(attributeKey)) {
          attributes[key] = resourceHash.attributes[attributeKey];
        }
      });
    }

    return attributes;
  },

  /*
    @method extractRelationships
    @param {Object} modelClass
    @param {Object} resourceHash
    @return {Object}
  */
  extractRelationships: function(modelClass, resourceHash) {
    let relationships = {};

    if (resourceHash.relationships) {
      modelClass.eachRelationship((key, relationshipMeta) => {
        let relationshipKey = this.keyForRelationship(key, relationshipMeta.kind, 'deserialize');
        if (resourceHash.relationships.hasOwnProperty(relationshipKey)) {

          let relationshipHash = resourceHash.relationships[relationshipKey];
          relationships[key] = this.extractRelationship(relationshipHash);

        }
      });
    }

    return relationships;
  },

  /*
    @method extractRelationship
    @param {Object} relationshipHash
    @return {Object}
  */
  extractRelationship: function(relationshipHash) {

    if (Ember.typeOf(relationshipHash.data) === 'object') {
      relationshipHash.data = this._normalizeRelationshipDataHelper(relationshipHash.data);
    }

    if (Ember.typeOf(relationshipHash.data) === 'array') {
      relationshipHash.data = map(relationshipHash.data, this._normalizeRelationshipDataHelper, this);
    }

    return relationshipHash;
  },

  /*
    @method _normalizeRelationshipDataHelper
    @private
    @param {Object} relationshipDataHash
    @return {Object}
  */
  _normalizeRelationshipDataHelper: function(relationshipDataHash) {
    let type = this.modelNameFromPayloadKey(relationshipDataHash.type);
    relationshipDataHash.type = type;
    return relationshipDataHash;
  },

  /*
   * SERIALIZATION
   */

  /**
    @method serialize
    @param {DS.Snapshot} snapshot
    @param {Object} options
    @return {Object}
  */
  serialize: function(snapshot, options) {
    let json = {};

    json.type = this.payloadKeyFromModelName(snapshot.modelName);

    if (options && options.includeId) {
      let id = snapshot.id;
      if (id) {
        json.id = coerceId(id);
      }
    }

    snapshot.eachAttribute((key, attribute) => {
      this.serializeAttribute(snapshot, json, key, attribute);
    });

    snapshot.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        this.serializeBelongsTo(snapshot, json, relationship);
      } else if (relationship.kind === 'hasMany') {
        this.serializeHasMany(snapshot, json, relationship);
      }
    });

    return { data: json };
  },

  /**
    @method serializeAttribute
    @param {DS.Snapshot} snapshot
    @param {Object} json
    @param {String} key
    @param {Object} attribute
  */
  serializeAttribute: function(snapshot, json, key, attribute) {
    var attributeType = attribute.type;

    if (this._shouldSerializeAttribute(snapshot, key)) {
      json.attributes = json.attributes || {};

      var value = snapshot.attr(key);
      if (attributeType) {
        var transform = this._transformFor(attributeType);
        value = transform.serialize(value);
      }

      var payloadKey =  this._getMappedKey(key);
      if (payloadKey === key) {
        payloadKey = this.keyForAttribute(key, 'serialize');
      }

      json.attributes[payloadKey] = value;
    }
  },

  /**
    @method serializeBelongsTo
    @param {DS.Snapshot} snapshot
    @param {Object} json
    @param {Object} relationship
  */
  serializeBelongsTo: function(snapshot, json, relationship) {
    var key = relationship.key;

    if (this._shouldSerializeBelongsTo(snapshot, key, relationship)) {
      var belongsTo = snapshot.belongsTo(key);
      if (belongsTo !== undefined) {

        json.relationships = json.relationships || {};

        var payloadKey = this._getMappedKey(key);
        if (payloadKey === key) {
          payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
        }

        let data = null;
        if (belongsTo) {
          data = {
            type: this.payloadKeyFromModelName(belongsTo.modelName),
            id: coerceId(belongsTo.id)
          };
        }

        json.relationships[payloadKey] = { data };
      }
    }
  },

  /**
    @method serializeHasMany
    @param {DS.Snapshot} snapshot
    @param {Object} json
    @param {Object} relationship
  */
  serializeHasMany: function(snapshot, json, relationship) {
    var key = relationship.key;

    if (this._shouldSerializeHasMany(snapshot, key, relationship)) {
      var hasMany = snapshot.hasMany(key);
      if (hasMany !== undefined) {

        json.relationships = json.relationships || {};

        var payloadKey = this._getMappedKey(key);
        if (payloadKey === key) {
          payloadKey = this.keyForRelationship(key, 'hasMany', 'serialize');
        }

        let data = map(hasMany, (item) => {
          return {
            type: this.payloadKeyFromModelName(item.modelName),
            id: coerceId(item.id)
          };
        });

        json.relationships[payloadKey] = { data };
      }
    }
  },

  /**
    @method serializeIntoHash
    @param {Object} hash
    @param {DS.Model} modelClass
    @param {DS.Snapshot} snapshot
    @param {Object} options
  */
  serializeIntoHash: function(hash, modelClass, snapshot, options) {
    merge(hash, this.serialize(snapshot, options));
  },


  /*
   * HELPERS
   */

  /**
    @method _applyTransforms
    @private
    @param {DS.Model} modelClass
    @param {Object} attributes
    @return {Object}
  */
  _applyTransforms: function(modelClass, attributes) {
    modelClass.eachTransformedAttribute((key, attributeType) => {
      if (!attributes.hasOwnProperty(key)) { return; }

      let transform = this._transformFor(attributeType);
      attributes[key] = transform.deserialize(attributes[key]);
    });
  },

  /**
    @method _transformFor
    @private
    @param {String} attributeType
    @param {Boolean} skipAssertion
    @return {DS.Transform}
  */
  _transformFor: function(attributeType, skipAssertion) {
    let transform = this.container.lookup('transform:' + attributeType);
    Ember.assert("Unable to find transform for '" + attributeType + "'", skipAssertion || !!transform);
    return transform;
  },


  /**
    @method normalizeUsingDeclaredMapping
    @param {String} attributeType
    @param {Boolean} skipAssertion
    @private
  */
  normalizeUsingDeclaredMapping: function(modelClass, hash) {
    let attrs = get(this, 'attrs');
    if (attrs) {
      for (let key in attrs) {
        let payloadKey = this._getMappedKey(key);
        if (!hash.hasOwnProperty(payloadKey)) { continue; }

        if (payloadKey !== key) {
          hash[key] = hash[payloadKey];
          delete hash[payloadKey];
        }
      }
    }
  },

  /**
    @method _getMappedKey
    @private
    @param {String} key
    @return {String} key
  */
  _getMappedKey: function(key) {
    let attrs = get(this, 'attrs');
    if (attrs && attrs[key]) {
      let mappedKey = attrs[key];
      // We need to account for both of the following forms:
      // - `{ title: 'post_title' }`
      // - `{ title: { key: 'post_title' }}`
      if (mappedKey.key) {
        mappedKey = mappedKey.key;
      }
      if (typeof mappedKey === 'string') {
        key = mappedKey;
      }
    }

    return key;
  },

  /**
    @method _canSerialize
    @private
    @param {String} key
    @return {boolean} true if the key can be serialized
  */
  _canSerialize: function(key) {
    var attrs = get(this, 'attrs');

    return !attrs || !attrs[key] || attrs[key].serialize !== false;
  },

  /**
    @method _mustSerialize
    @private
    @param {String} key
    @return {boolean} true if the key must be serialized
  */
  _mustSerialize: function(key) {
    var attrs = get(this, 'attrs');

    return attrs && attrs[key] && attrs[key].serialize === true;
  },

  /**
    @method _shouldSerializeAttribute
    @param {DS.Snapshot} snapshot
    @param {String} key
    @return {boolean} true if the attribute should be serialized
    @private
  */
  _shouldSerializeAttribute: function (snapshot, key) {
    if (this._mustSerialize(key)) {
      return true;
    }
    return this._canSerialize(key);
  },

  /**
    @method _shouldSerializeBelongsTo
    @private
    @param {DS.Snapshot} snapshot
    @param {String} key
    @param {String} relationship
    @return {boolean} true if the belongsTo relationship should be serialized
  */
  _shouldSerializeBelongsTo: function (snapshot, key, relationship) {
    if (this._mustSerialize(key)) {
      return true;
    }
    return this._canSerialize(key);
  },

  /**
    @method _shouldSerializeHasMany
    @private
    @param {DS.Snapshot} snapshot
    @param {String} key
    @param {String} relationship
    @return {boolean} true if the hasMany relationship should be serialized
  */
  _shouldSerializeHasMany: function (snapshot, key, relationship) {
    let relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);
    if (this._mustSerialize(key)) {
      return true;
    }
    return this._canSerialize(key) && (relationshipType === 'manyToNone' || relationshipType === 'manyToMany');
  }

});

