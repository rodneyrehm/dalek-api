'use strict';

var expect = require('chai').expect;

var helper = {
  message: function(done, message) {
    return function() {
      done(new Error(message));
    };
  },
  
  error: function(done) {
    return function() {
      try {
        expect(arguments[0].message).to.be.ok;
        done();
      } catch(error) {
        done(error);
      }
    };
  },
  
  expect: function(done, callback) {
    return function() {
      try {
        callback.apply(this, arguments);
        done();
      } catch (error) {
        done(error);
      }
    };
  }
};

helper.notRejected = function(done) {
  return helper.message(done, 'unexpected rejection');
};

module.exports = helper;