'use strict';

var Assertions = require('./assertions.js');
var Q = require('q');

function Unit(parent) {
  this.initialize(parent);
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

    var queuedItem = this.queue();
    args.unshift(queuedItem.reject);
    args.unshift(queuedItem.resolve);

    queuedItem.run(function() {
      
      // TODO: loop args to replace runtimeArguments
      
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
    throw new Error('Cannot add to queue while being processed, have you forgotton to call .pipe()?');
  }
  
  var deferred = Q.defer();
  var runner = Q.defer();
  this._queue.push(runner.resolve.bind(runner));
  
  deferred.promise.then(function(result) {
    console.log('Action resolved');
    // FIXME: an action might've yielded some data
    this._buffer = result;
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
      this._deferred.reject(error);
      return;
    }
    
    if (this.options.abortOnAssertionFailure) {
      console.error('Aborted execution as instructed by abortOnAssertionFailure option');
      this._result = 'FAILED';
      this._deferred.reject(error);
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
    this._deferred.resolve();
  }
};

Unit.prototype.pipe = function(done, error) {
  var _unit = new Unit(this.unit);
  _unit._then(done, error);
  return _unit;
};

Unit.prototype.initialize = function(parent) {
  // parent may be dalek, suite, unit
  this.parent = parent;
  this.dalek = parent.dalek;
  this.unit = this;

  this.context = this;
  this.contextStack = [];

  this._deferred = Q.defer();
  this._then = this._deferred.promise.then.bind(this._deferred.promise);

  this._queue = [];
  this._items = 0;
  this._result = 'OK'; // FAILED, ERROR
  
  // temporary storage for action/assertion response data
  this._buffer = undefined;

  // TODO: real options handling
  this.options = {
    abortOnAssertionFailure: false
  };

  this.assert = new Assertions(this);
};

module.exports = Unit;