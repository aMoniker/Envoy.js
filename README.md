# Envoy.js

[![Build Status](https://api.travis-ci.org/aMoniker/Envoy.js.png)](https://api.travis-ci.org/aMoniker/Envoy.js)

Envoy.js is a simple wrapper for [Backbone.Events](http://backbonejs.org/#Events) which provides a convenient global mediator object (`window.envoy`) and adds a reverse pub/sub pattern dubbed __offer/solicit__.

Since it uses Backbone.Events (and some Underscore methods) it requires both [Backbone.js](http://backbonejs.org/) and [Underscore.js](http://underscorejs.org/).

### Basic Usage
Usage is simple:

```javascript
envoy.offer('named_key', { any: 'value' });
var result = envoy.solicit('named_key');
```

You can offer multiple items using the same key, and calling `envoy.solicit` on that key will retrieve all those items.

```javascript
envoy.offer('multiple_values', { something: 'good' });
envoy.offer('multiple_values', { more: 'surprises' });
var results = envoy.solicit('multiple_values');
```

That's the basic premise. Envoy.js also adds a few extra conveniences, and exposes just three methods: `envoy.offer()`, `envoy.solicit()`, and `envoy.withdraw()`.

### API

`envoy.offer(key, callback, namespace);`
- `key` _(required)_: Each key can be used by multiple offers. It's probably best to use a string, but technically this could be any value.
- `callback` _(required)_: If it's a function, it will be called and the result will be returned during `envoy.solicit`. All other types will be returned directly.
- `namespace` _(optional)_: A way to separate values that share the same key. If included in a call to `envoy.solicit`, the namespace will act as a filter and will only return offers with the same namespace.

`envoy.withdraw(key, namespace);`
- `key` _(required)_: Withdraw all offers made for this key.
- `namespace` _(optional)_: Only withdraw offers that match the given key & namespace.

`envoy.solicit(key ...);`
- `key` _(required)_: Get offers for this key.
- These three arguments are all _optional_ and can be combined in _any_ order after `key`:
  - `first_result`: Boolean value. If present (and `true`) then only the first offer (FIFO) will be returned.
  - `namespace`: String. Only return offers with this namespace.
  - `callback`: Function. If present, invoke this function using the returned offers as the only argument.

### Example

```javascript
// Meanwhile in the kitchen
envoy.offer('breakfast', 'greasy bacon', 'meat');
envoy.offer('breakfast', function() {
    return 'delicious eggs';
}, 'almost-meat');
envoy.offer('breakfast', { cheeses: ['cheddar', 'gouda', '6pool'] });

// sorry, you're too fat for bacon
envoy.withdraw('breakfast', 'meat');

// store the result as a var
var breakfast = envoy.solicit('breakfast');

// or just run a callback on the result
envoy.solicit('breakfast', function(foods) {
    _.each(foods, function(food) {
        console.log('Eating ' +food+ '...');
    });
});
```

### Additional Functionality

`envoy` can also be used as a simple global key/value store if you don't need the enhanced functionality of offer/solicit.

Simply use: `envoy.store(key, value);` to store a global value of any data type, then `envoy.fetch(key);` to retrieve it.

Storing a key will overwrite any previous key of the same name.

Use `envoy.erase(key);` to remove a key/val pair.

Also, `envoy.rouse(key);` will invoke and return the result of any stored functions. What's neat is that it will also deep traverse a stored object or array, maintaining indexes and invoking all functions along the way.