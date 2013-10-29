'use strict';

var Assertions = require('./assertions.js');
var RuntimeArgument = require('./runtimeargument.js');
var Q = require('q');

function Unit(parent) {
  this.initialize(parent);
}

Unit._actionOptions = {};
Unit._assertionOptions = {};

Unit._addAction = function(name, callback, options) {
  if (Unit.prototype[name]) {
    throw new Error('The Action "' + name + '" is already registered');
  }
  
  Unit.prototype[name] = Unit._wrapForQueue(name, callback, options);
};

Unit._addAssertion = function(name, callback, options) {
  if (Assertions.prototype[name]) {
    throw new Error('The Assertion "' + name + '" is already registered');
  }
  
  Assertions.prototype[name] = Unit._wrapForQueue(name, callback, options);
};

Unit._wrapForQueue = function(name, callback, options) {
  return function() {
    // this === unit
    
    if (!options) {
      options = {};
    }
    
    var unit = this.unit;
    var args = [].slice.call(arguments);

    // query context (just like chaining context) are declaration time
    args = unit._resolveDeclarationArguments(args, options);
    
    var queuedItem = this.queue();
    args.unshift(queuedItem.reject);
    args.unshift(queuedItem.resolve);

    queuedItem.run(function() {
      // runtime arguments need to be resolved at execution time
      args = unit._resolveRuntimeArguments(args, options);
      
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

Unit.prototype.arg = function(type, options) {
  return new RuntimeArgument(type, options);
};

Unit.prototype._resolveRuntimeArguments = function(args, options) {
  var unit = this;
  
  args = args.map(function(arg) {
    return arg instanceof RuntimeArgument
      ? arg.toValue(unit)
      : arg;
  });
  
  return args;
};

Unit.prototype._resolveDeclarationArguments = function(args, options) {
  if (options.query && this._query) {
    args.unshift(this._query);
  }
  
  return args;
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
    console.log('> resolved with', result);
    if (result !== undefined) {
      this._buffer = result;
    }

    // reset invokation block and continue processing the queue
    this._item = null;
    this.done();
  }.bind(this), function(error) {
    
    // TODO: figure out if this is an assertion or not
    
    console.log('> rejected');
    if (error && typeof error.message === 'string' ) {
      console.error('> ' + error.message);
      console.log(error.stack);
      this._result = 'FAILED';
      this._deferred.reject(error);
      return;
    }
    
    if (this.options.abortOnAssertionFailure) {
      console.error('> Aborted execution as instructed by abortOnAssertionFailure option');
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
    console.log('--------------------------------');
    console.log('execute item ' + this._items);
    this._item();
  } else {
    console.log('DONE! executed ' + this._items + ' items');
    this._deferred.resolve(this._buffer);
  }
};

Unit.prototype.query = function(query) {
  this._query = query || null;
  return this.context;
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
  this._buffer = null;
  // temporary storage for query(selector)
  this._query = null;
  if (parent instanceof Unit) {
    this._buffer = parent._buffer;
    this._query = parent._query;
  }

  // TODO: real options handling
  this.options = {
    abortOnAssertionFailure: false
  };

  this.assert = new Assertions(this);
};

module.exports = Unit;