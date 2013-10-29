'use strict';

var Assertions = require('./assertions.js');
var Q = require('q');

function Unit(dalek) {
  this.dalek = dalek;
  this.unit = this;
  
  this.context = this;
  this.contextStack = [];
  
  this._queue = [];
  this._items = 0;
  this._result = 'OK'; // FAILED, ERROR
  
  // TODO: real options handling
  this.options = {
    abortOnAssertionFailure: false
  };
  
  this.assert = new Assertions(this);
}

Unit.actions = {};
Unit.assertions = {};

Unit._addAction = function(name, callback) {
  if (Unit.actions[name]) {
    throw new Error('The Action "' + name + '" is already registered');
  }
  
  Unit.actions[name] = callback;
  Unit.prototype[name] = Unit._wrapForQueue(name, callback);
};

Unit._addAssertion = function(name, callback) {
  if (Unit.assertions[name]) {
    throw new Error('The Assertion "' + name + '" is already registered');
  }
  
  Unit.assertions[name] = callback;
  Assertions.prototype[name] = Unit._wrapForQueue(name, callback);
};

Unit._wrapForQueue = function(name, callback) {
  return function() {
    // this === unit
    var unit = this.unit;
    var args = [].slice.call(arguments);
    
    if (this._item) {
      // while processing the queue, all calls have to return a promise to allow
      // plugins to access these methods internally - without affecting the queue
      var deferred = Q.defer();
      args.unshift(deferred.reject.bind(deferred));
      args.unshift(deferred.resolve.bind(deferred));
      callback.apply(unit, args);
      return deferred.promise;
    }

    var queuedItem = this.queue();
    args.unshift(queuedItem.reject);
    args.unshift(queuedItem.resolve);
    
    queuedItem.run(function() {
      try {
        // TODO: safeguard against forgotten resolve()/reject()
        callback.apply(unit, args);
      } catch (error) {
        // TODO: figure out how to differentiate exceptions from assertionFailure, only the latter is abortOnAssertionFailure relevant
        queuedItem.reject(error);
      }
    });

    return unit.context;
  };
};

Unit.prototype.queue = function() {
  // returns { resolve: funcToCallWhenDone, reject: funcToCallWhenFailed, run: callbackForThisItem }
  
  if (this._item) {
    throw new Error('Cannot add to queue while being processed');
  }
  
  var deferred = Q.defer();
  var runner = Q.defer();
  this._queue.push(runner.resolve.bind(runner));
  
  deferred.promise.then(function(response) {
    console.log('Action resolved');
    // FIXME: an action might've yielded some data
    this._response = response;
    // reset invokation block and continue processing the queue
    this._item = null;
    this.done();
  }.bind(this), function(error) {
    
    // TODO: figure out if this is an assertion or not
    
    console.log('Action rejected');
    if (error && typeof error.message === 'string' ) {
      console.error(error.message);
      console.log(error.stack);
      this._result = 'FAILED';
      return;
    }
    
    if (this.options.abortOnAssertionFailure) {
      console.error('Aborted execution as instructed by abortOnAssertionFailure option');
      this._result = 'FAILED';
      return;
    }
    
    console.warn(error);
    
    // mark the unit as not fully passed
    this._result = 'ERROR';
    // reset invokation block and continue processing the queue
    this._item = null;
    this.done();
  }.bind(this));
  
  return {
    resolve: deferred.resolve.bind(deferred),
    reject: deferred.reject.bind(deferred),
    run: runner.promise.then.bind(runner.promise)
  };
};

Unit.prototype.done = function() {
  if (this._item) {
    throw new Error('Cannot execute task while another task is still running');
  }
  
  this._item = this._queue.shift();
  if (this._item) {
    this._items++;
    console.log('execute item ' + this._items);
    this._item();
  } else {
    console.log('DONE! executed ' + this._items + ' items');
  }
};

module.exports = Unit;