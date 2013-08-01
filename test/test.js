var assert = require('assert');
var should = require('should');

var global_object = typeof window !== 'undefined' ? window
                  : typeof GLOBAL !== 'undefined' ? GLOBAL
                  : {};

global_object._ = require('underscore')._;
global_object.Backbone = require('backbone');
require('../envoy.js');

var test_offers_exists = function() {
    should.exist(envoy._offers);
    envoy._offers.should.be.a('object');
    envoy._offers.should.eql({});
}

var test_offer_exists = function(key, callback, namespace) {
    should.exist(envoy._offers[key]);
    envoy._offers[key].should.be.an.instanceof(Array);
    envoy._offers[key].should.have.length(1);

    should.exist(envoy._offers[key][0]);
    envoy._offers[key][0].should.be.a('object');
    envoy._offers[key][0].should.include({ callback: callback });
    envoy._offers[key][0].should.include({ namespace: namespace });
}

var add_namespaced_offers = function() {
    envoy.offer('test_key', 'value_1');
    envoy.offer('test_key', 'value_2', 'namespace_1');
    envoy.offer('test_key', 'value_3', 'namespace_2');
    envoy.offer('test_key', 'value_4', 'namespace_2');

    should.exist(envoy._offers['test_key']);
    envoy._offers['test_key'].should.be.an.instanceof(Array);
    envoy._offers['test_key'].should.have.length(4);

    envoy._offers['test_key'][0].should.be.a('object');
    envoy._offers['test_key'][0].should.include({ callback: 'value_1' });
    envoy._offers['test_key'][0].should.include({ namespace: undefined });

    envoy._offers['test_key'][1].should.be.a('object');
    envoy._offers['test_key'][1].should.include({ callback: 'value_2' });
    envoy._offers['test_key'][1].should.include({ namespace: 'namespace_1' });

    envoy._offers['test_key'][2].should.be.a('object');
    envoy._offers['test_key'][2].should.include({ callback: 'value_3' });
    envoy._offers['test_key'][2].should.include({ namespace: 'namespace_2' });

    envoy._offers['test_key'][3].should.be.a('object');
    envoy._offers['test_key'][3].should.include({ callback: 'value_4' });
    envoy._offers['test_key'][3].should.include({ namespace: 'namespace_2' });
}

var clear_offers = function() {
    envoy._offers = {};
}

describe('envoy.setup', function() {
    describe('properties', function() {
        it('should be available globally', function() {
            should.exist(global_object.envoy);
            envoy.should.be.a('object');
        });

        it('should have _offers object', function() {
            should.exist(envoy._offers);
            envoy._offers.should.eql({});
            envoy._offers.should.be.a('object');
        });

        it('should have functions defined', function() {
            should.exist(envoy.offer);
            should.exist(envoy.withdraw);
            should.exist(envoy.solicit);
            envoy.offer.should.be.a('function');
            envoy.withdraw.should.be.a('function');
            envoy.solicit.should.be.a('function');
        });
    });
});

describe('envoy.offer', function() {
    beforeEach(function() {
        test_offers_exists();
    });

    afterEach(function() {
        clear_offers();
    });

    it('should accept a boolean as a key', function() {
        envoy.offer(true, 'test_value');
        test_offer_exists(true, 'test_value');
    });

    it('should accept a number as a key', function() {
        envoy.offer(1337, 'test_value');
        test_offer_exists(1337, 'test_value');
    });

    it('should accept a string as a key', function() {
        envoy.offer('test_key', 'test_val');
        test_offer_exists('test_key', 'test_val');
    });

    it('should accept an object as a key', function() {
        envoy.offer({}, 'test_val');
        test_offer_exists({}, 'test_val');
    });

    it('should accept an array as a key', function() {
        envoy.offer([], 'test_val');
        test_offer_exists([], 'test_val');
    });

    it('should accept a null as a key', function() {
        envoy.offer(null, 'test_val');
        test_offer_exists(null, 'test_val');
    });

    it('should accept an undefined as a key', function() {
        envoy.offer(undefined, 'test_val');
        test_offer_exists(undefined, 'test_val');
    });

    it('should add an offer with a callback function', function() {
        var test_callback = function() { return 'test_value'; }
        envoy.offer('test_key', test_callback);
        test_offer_exists('test_key', test_callback);
    });

    it('should add an offer with a namespace', function() {
        envoy.offer('test_key', 'test_value', 'test_namespace');
        test_offer_exists('test_key', 'test_value', 'test_namespace');
    });
});

describe('envoy.withdraw', function() {
    beforeEach(function() {
        test_offers_exists();
        add_namespaced_offers();
    });

    afterEach(function() {
        clear_offers();
    });

    it('should remove all entries for a given key', function() {
        envoy.withdraw('test_key');
        envoy._offers.should.eql({});
    });

    it('should remove only a namespaced offer', function() {
        envoy.withdraw('test_key', 'namespace_1');
        should.exist(envoy._offers['test_key']);
        envoy._offers['test_key'].should.be.an.instanceof(Array);
        envoy._offers['test_key'].should.have.length(3);
        _.each(envoy._offers['test_key'], function(offer) {
            offer.should.be.a('object');
            offer.should.not.include({ namespace: 'namespace_1' });
        });
    });

    it('shouldnt remove non-matching offers', function() {
        envoy.withdraw('nonexistant_offer');
        should.exist(envoy._offers['test_key']);
        envoy._offers['test_key'].should.be.an.instanceof(Array);
        envoy._offers['test_key'].should.have.length(4);

        envoy.withdraw('nonexistant_offer', 'nonexistant_namespace');
        should.exist(envoy._offers['test_key']);
        envoy._offers['test_key'].should.be.an.instanceof(Array);
        envoy._offers['test_key'].should.have.length(4);
    });
});

describe('envoy.solicit', function() {
    beforeEach(function() {
        test_offers_exists();
        add_namespaced_offers();
    });

    afterEach(function() {
        clear_offers();
    });

    it('should return all offers for a given key', function() {
        var solicited_offers = envoy.solicit('test_key');
        should.exist(solicited_offers);
        solicited_offers.should.be.an.instanceof(Array);
        solicited_offers.should.eql(['value_1', 'value_2', 'value_3', 'value_4']);
    });

    it('should return all offers for a given key and namespace', function() {
        var solicited_offers = envoy.solicit('test_key', 'namespace_1');
        should.exist(solicited_offers);
        solicited_offers.should.be.an.instanceof(Array);
        solicited_offers.should.eql(['value_2']);

        var solicited_offers = envoy.solicit('test_key', 'namespace_2');
        should.exist(solicited_offers);
        solicited_offers.should.be.an.instanceof(Array);
        solicited_offers.should.eql(['value_3', 'value_4']);
    });

    it('should call a given callback with offers and return the result', function() {
        var solicited_offers = envoy.solicit('test_key', function(offers) {
            should.exist(offers);
            offers.should.be.an.instanceof(Array);
            offers.should.have.length(4);
            return 'callback_value';
        });

        solicited_offers.should.equal('callback_value');
    });

    it('should return a single value when passed the first_result boolean', function() {
        var solicited_offer = envoy.solicit('test_key', true);
        should.exist(solicited_offer);
        solicited_offer.should.be.a('string');
        solicited_offer.should.equal('value_1');
    });

    it('should return the same result no matter the optional argument order', function() {
        var the_callback = function(offer) {
            should.exist(offer);
            offer.should.be.a('string');
            offer.should.equal('value_2');
        }

        envoy.solicit('test_key', true, 'namespace_1', the_callback);
        envoy.solicit('test_key', true, the_callback, 'namespace_1');
        envoy.solicit('test_key', 'namespace_1', true, the_callback);
        envoy.solicit('test_key', 'namespace_1', the_callback, true);
        envoy.solicit('test_key', the_callback, 'namespace_1', true);
        envoy.solicit('test_key', the_callback, true, 'namespace_1');
    });
});

var test_storage_exists = function() {
    should.exist(envoy._storage);
    envoy._storage.should.be.a('object');
    envoy._storage.should.eql({});
}

var test_stored_value = function(key, value) {
    should.exist(envoy._storage);
    should.exist(envoy._storage[key]);
    envoy._storage[key].should.eql(value);
}

var store_test_values = function() {
    envoy.store(true, false);
    envoy.store(1337, 2600);
    envoy.store('test_key', 'test_val');
    envoy.store({}, { hello: 'there' });
    envoy.store([], [1,2,3]);
    envoy.store(null, null);
    envoy.store(undefined, undefined);
}

var clear_storage = function() {
    envoy._storage = {};
}

describe('envoy.store', function() {
    beforeEach(function() {
        test_storage_exists();
    });

    afterEach(function() {
        clear_storage();
    });

    it('should accept booleans', function() {
        envoy.store(true, false);
        test_stored_value(true, false);
    });

    it('should accept numbers', function() {
        envoy.store(1337, 2600);
        test_stored_value(1337, 2600);
    });

    it('should accept strings', function() {
        envoy.store('test_key', 'test_val');
        test_stored_value('test_key', 'test_val');
    });

    it('should accept objects', function() {
        envoy.store({}, { hello: 'there' });
        test_stored_value({}, { hello: 'there' });
    });

    it('should accept arrays', function() {
        envoy.store([], [1,2,3]);
        test_stored_value([], [1,2,3]);
    });

    it('should accept nulls', function() {
        envoy.store(null, null);
        should.exist(envoy._storage);
        should.equal(envoy._storage[null], null);
    });

    it('should accept undefineds', function() {
        envoy.store(undefined, undefined);
        should.exist(envoy._storage);
        should.equal(envoy._storage[undefined], undefined);
    });
});

describe('envoy.fetch', function() {
    beforeEach(function() {
        test_storage_exists();
        store_test_values();
    });

    afterEach(function() {
        clear_storage();
    });

    it('should fetch the right values', function() {
        var stored = [
             { key: true, val: false }
            ,{ key: 1337, val: 2600 }
            ,{ key: 'test_key', val: 'test_val' }
            ,{ key: {}, val: { hello: 'there' } }
            ,{ key: [], val: [1,2,3] }
            ,{ key: null, val: null }
            ,{ key: undefined, val: undefined }
        ];

        _.each(stored, function(s) {
            var fetched = envoy.fetch(s.key);
            if (fetched) {
                fetched.should.eql(s.val);
            } else {
                should.equal(fetched, s.val);
            }
        });
    })
});

describe('envoy.erase', function() {
    beforeEach(function() {
        test_storage_exists();
        store_test_values();
    });

    afterEach(function() {
        clear_storage();
    });

    it('should delete values', function() {
        envoy.erase('test_key');
        should.not.exist(envoy._storage['test_key']);
    });
});