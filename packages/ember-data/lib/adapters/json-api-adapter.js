/**
  @module ember-data
*/

import {
  Adapter,
  InvalidError
} from "ember-data/system/adapter";

import BuildURLMixin from "ember-data/adapters/build-url-mixin";

var get = Ember.get;
var forEach = Ember.ArrayPolyfills.forEach;

/**
  @class JSONAPIAdapter
  @constructor
  @namespace DS
  @extends DS.Adapter
*/
export default Adapter.extend(BuildURLMixin, {
  defaultSerializer: '-json-api',

  coalesceFindRequests: false,

  /**
    @property host
    @type {String}
  */

  /**
    @property namespace
    @type {String}
  */

  find: function(store, type, id, record) {
    return this.ajax(this.buildURL(type.typeKey, id, record), 'GET');
  },

  findAll: function(store, type) {
    return this.ajax(this.buildURL(type.typeKey), 'GET');
  },

  findMany: function(store, type, ids, records) {
    var data = {
      filter: {
        id: ids.join(',')
      }
    };
    return this.ajax(this.buildURL(type.typeKey, ids, records), 'GET', { data: data });
  },

  findQuery: function(store, type, query) {
    return this.ajax(this.buildURL(type.typeKey), 'GET', { data: query });
  },



  findBelongsTo: function(store, record, link, relationship) {
    var url, id, type;

    if (link.resource) {
      url = link.resource;
    } else {
      id = get(record, 'id');
      type = record.constructor.typeKey;
      url = this.buildURL(type, id);
    }

    return this.ajax(url, 'GET');
  },

  findHasMany: function(store, record, link, relationship) {
    var url; //, id, type, host;

    if (link.resource) {
      url = link.resource;
    } else {
      // TODO
      return;
    }

    return this.ajax(url, 'GET');
  },



  createRecord: function(store, type, record) {
    var serializer = store.serializerFor(type.typeKey);

    var snapshot = record._createSnapshot();
    var data = serializer.serialize(snapshot);

    return this.ajax(this.buildURL(type.typeKey, null, record), "POST", { data: data });
  },

  updateRecord: function(store, type, record) {
    var serializer = store.serializerFor(type.typeKey);

    var snapshot = record._createSnapshot();
    var data = serializer.serialize(snapshot, { includeId: true });

    var id = get(record, 'id');

    return this.ajax(this.buildURL(type.typeKey, id, record), "PUT", { data: data });
  },

  deleteRecord: function(store, type, record) {
    var id = get(record, 'id');

    return this.ajax(this.buildURL(type.typeKey, id, record), "DELETE");
  },


  pathForType: function(typeKey) {
    return Ember.String.dasherize(typeKey);
  },


  ajax: function(url, type, options) {
    var adapter = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash = adapter.ajaxOptions(url, type, options);

      hash.success = function(json, textStatus, jqXHR) {
        json = adapter.ajaxSuccess(jqXHR, json);
        if (json instanceof InvalidError) {
          Ember.run(null, reject, json);
        } else {
          Ember.run(null, resolve, json);
        }
      };

      hash.error = function(jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, adapter.ajaxError(jqXHR, jqXHR.responseText, errorThrown));
      };

      Ember.$.ajax(hash);
    }, 'DS: JSONAPIAdapter#ajax ' + type + ' to ' + url);
  },

  ajaxOptions: function(url, type, options) {
    var hash = options || {};
    hash.url = url;
    hash.type = type;
    hash.dataType = 'json';
    hash.context = this;

    if (hash.data && type !== 'GET') {
      hash.contentType = 'application/json; charset=utf-8';
      hash.data = JSON.stringify(hash.data);
    }

    var headers = get(this, 'headers');
    if (headers !== undefined) {
      hash.beforeSend = function (xhr) {
        forEach.call(Ember.keys(headers), function(key) {
          xhr.setRequestHeader(key, headers[key]);
        });
      };
    }

    return hash;
  },

  ajaxError: function(jqXHR, responseText, errorThrown) {
    var isObject = jqXHR !== null && typeof jqXHR === 'object';

    if (isObject) {
      jqXHR.then = null;
      if (!jqXHR.errorThrown) {
        if (typeof errorThrown === 'string') {
          jqXHR.errorThrown = new Error(errorThrown);
        } else {
          jqXHR.errorThrown = errorThrown;
        }
      }
    }

    return jqXHR;
  },

  ajaxSuccess: function(jqXHR, jsonPayload) {
    return jsonPayload;
  }

});
