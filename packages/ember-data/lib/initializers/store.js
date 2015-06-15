import { JSONAPISerializer, JSONSerializer, RESTSerializer } from "ember-data/serializers";
import { JSONAPIAdapter, RESTAdapter } from "ember-data/adapters";
import ContainerProxy from "ember-data/system/container-proxy";

/**
  Configures a registry for use with an Ember-Data
  store. Accepts an optional namespace argument.

  @method initializeStore
  @param {Ember.Registry} registry
  @param {Object} [application] an application namespace
*/
export default function initializeStore(registry, application) {
  Ember.deprecate('Specifying a custom Store for Ember Data on your global namespace as `App.Store` ' +
                  'has been deprecated. Please use `App.ApplicationStore` instead.', !(application && application.Store));

  registry.optionsForType('serializer', { singleton: false });
  registry.optionsForType('adapter', { singleton: false });

  // This will get deprecated later in the instace
  // initializer. However we register it here so we have access to
  // application.Store in the instance initializer.
  if (application && application.Store) {
    registry.register('store:application', application.Store);
  }

  // allow older names to be looked up

  var proxy = new ContainerProxy(registry);
  proxy.registerDeprecations([
    { deprecated: 'serializer:_default',  valid: 'serializer:-default' },
    { deprecated: 'serializer:_rest',     valid: 'serializer:-rest' },
    { deprecated: 'adapter:_rest',        valid: 'adapter:-rest' }
  ]);

  // new go forward paths
  registry.register('serializer:-default', JSONSerializer);
  registry.register('serializer:-rest', RESTSerializer);
  registry.register('adapter:-rest', RESTAdapter);

  if (Ember.FEATURES.isEnabled('ds-new-serializer-api')) {
    registry.register('adapter:-json-api', JSONAPIAdapter);
    registry.register('serializer:-json-api', JSONAPISerializer);
  }
}
