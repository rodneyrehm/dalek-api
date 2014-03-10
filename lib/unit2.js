'use strict';

var DalekError = require('dalek.error');

var Q = require('q');
Q.longStackSupport = true;

var counter = 0;

function Unit(parent) {
  this.initialize(parent);
}

Unit.prototype.initialize = function(parent) {
  // identify unit internally
  this.id = counter++;
  
  // keeping track of where we are in the process
  this.state = 'registration';
  
  // public promise for Unit fullfillment
  this._deferred = Q.defer();
  this.promise = this._deferred.promise;

  // task queue
  var queue = Q.defer();
  this._queue = queue.promise;
  this._runQueue = this._queue.resolve.bind(this._queue);
  
  // remember context
  this._parent = parent;
  this._dalek = parent.dalek;
  this._emit = this.dalek._emit;
  
  // internal context
  this._context = context;
  
  this._emit('unit.state', this.id, 'registration');
};

/**
 * start executing the registered tasks
 */
Unit.prototype.run = function() {
  if (this._parent instanceof Unit && this._parent._state != 'exection') {
    throw new Error('Cannot run() Unit while parent Unit is not executing');
  }
  
  this._state = 'exection';
  this._emit('unit.state', this.id, 'exection');

  // add public
  this._appendToQueue(
    this._queueResolved,
    this._queueRejected
  );
  
  return this;
};

/**
 * add a callback to the task promise queue
 */
Unit.prototype._appendToQueue = function(callback, error) {
  this._queue = this._queue.then(callback.bind(this), error.bind(this));
  return this;
};

/**
 * handle successfully finishing the task promise queue
 */
Unit.prototype._queueResolved = function(data) {
  this._state = 'resolved';
  this._emit('unit.state', this.id, 'resolved');
  this._deferred.resolve(data);
};

/**
 * handle unsuccessfully finishing the task promise queue
 */
Unit.prototype._queueRejected = function(error) {
  this._state = 'failed';
  this._emit('unit.state', this.id, 'failed');
  this._deferred.reject(error);
};

/**
 * handle successfully finishing task within the promise queue
 */
Unit.prototype._queueResolved = function(data) {
  if (data !== undefined) {
    this._buffer = data;
  }

  // TODO: reset timeout;
  
  return this._buffer;
};

/**
 * handle unsuccessfully finishing task within the promise queue
 */
Unit.prototype._queueRejected = function(error) {
  if (this.options.continueOnError && error instanceof DalekError) {
    // ignore DalekErrors only
    return this._buffer;
  }
  
  throw error;
};

Unit.prototype.async = function(callback) {
  // TODO: start timeout;
  this._appendToQueue(callback);
  this._appendToQueue(this._itemResolved, this._itemRejected);
};


















Unit.prototype.done = function() { 
  console.warn('Unit.done() is deprecated');
};

