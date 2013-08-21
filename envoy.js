if (_ && _.clone && Backbone && Backbone.Events) {
    var envoy = _.clone(Backbone.Events);

    envoy._offers = {};

    envoy.offer = function(key, callback, namespace) {
        envoy._offers[key] = envoy._offers[key] || [];
        envoy._offers[key].push({
             callback: callback
            ,namespace: (namespace || undefined)
        });
    }

    envoy.withdraw = function(key, namespace) {
        if (_.size(envoy._offers[key]) <= 0) { return undefined; }

        var withdrawn = false;
        namespace = namespace || undefined;

        if (namespace === undefined) {
            delete envoy._offers[key];
        } else {
            var filtered_offers = [];
            _.each(envoy._offers[key], function(offer, idx) {
                if (offer.namespace === namespace) {
                    withdrawn = true; // don't add to filtered_offers
                } else {
                    filtered_offers.push(envoy._offers[key][idx]);
                }
            });

            envoy._offers[key] = filtered_offers;

            if (_.size(envoy._offers[key]) <= 0) {
                delete envoy._offers[key];
            }
        }

        return withdrawn;
    }

    envoy.solicit = function(key) {
        if (_.size(envoy._offers[key]) <= 0) { return undefined; }

        var args = Array.prototype.slice.call(arguments, 1, 4);
        var first_result = _.find(args, function(a) { return typeof a === 'boolean';  });
        var namespace    = _.find(args, function(a) { return typeof a === 'string';   });
        var callback     = _.find(args, function(a) { return typeof a === 'function'; });

        var offers = [];
        _.every(envoy._offers[key], function(offer, idx) {
            if (namespace === undefined || namespace === offer.namespace) {
                if (typeof offer.callback === 'function') {
                    offers.push(offer.callback());
                } else {
                    offers.push(offer.callback);
                }

                if (first_result) {
                    offers = offers[0];
                    return false;
                }
            }
            return true;
        });

        if (callback) {
            return callback(offers);
        } else {
            return offers;
        }
    }

    envoy._storage = {};

    envoy.store = function(key, value) {
        envoy._storage[key] = value;
        return value;
    }

    envoy.fetch = function(key, default_value) {
        return envoy._storage[key] !== undefined ? envoy._storage[key] : default_value;
    }

    envoy.rouse = function(key, default_value) {
        var roused_value = envoy._rouseVal(envoy._storage[key]);
        return roused_value !== undefined ? roused_value : default_value;
    }

    envoy._rouseVal = function(val) {
        var ret, is_array;
        if (_.isFunction(val)) {
            ret = val();
        } else if (is_array = _.isArray(val) || _.isObject(val)) {
            ret = is_array ? [] : {};
            _.each(val, function(v, i) {
                ret[i] = envoy._rouseVal(v);
            });
        } else {
            ret = val;
        }
        return ret;
    }

    envoy.erase = function(key) {
        delete envoy._storage[key];
        return true;
    }

    var global_object = typeof window !== 'undefined' ? window
                      : typeof GLOBAL !== 'undefined' ? GLOBAL
                      : {};
    global_object.envoy = envoy;
}