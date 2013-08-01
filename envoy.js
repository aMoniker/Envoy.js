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

        _.each(envoy._offers[key], function(offer, idx) {
            if (offer.namespace === namespace) {
                withdrawn = true;
                envoy._offers[key].splice(idx, 1);
            }
        });

        if (_.size(envoy._offers[key]) <= 0) {
            delete envoy._offers[key];
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

    window.envoy = envoy;
}