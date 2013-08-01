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

describe('Envoy.setup', function() {
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

describe('Envoy.offer', function() {
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

describe('Envoy.withdraw', function() {
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

describe('Envoy.solicit', function() {
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