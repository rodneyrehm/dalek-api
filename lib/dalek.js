'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var Assertions = require('./assertions.js');
var Unit = require('./unit.js');


function Dalek() {
  this.initialize();
}

Dalek.Unit = Unit;
Dalek.Assertions = Assertions;

Dalek.prototype.addAction = function(name, callback, options) {
  Unit._addAction(name, callback, options);
};

Dalek.prototype.addAssertion = function(name, callback, options) {
  Unit._addAssertion(name, callback, options);
};

Dalek.prototype.loadPlugins = function(globPattern) {
  // TODO: expand globPattern and load files
  require('./actions/core-actions.js')(this);
  require('./assertions/core-assertions.js')(this);
};

Dalek.prototype._loadPlugin = function(file) {
  require(file)(this);
  return this;
};

Dalek.prototype.initialize = function() {
  this.events = new EventEmitter2();
  this.events.setMaxListeners(Infinity);
  this.emit = this.events.emit.bind(this.events);
};

// load core plugins
var dalek = {
  addAction: Dalek.prototype.addAction,
  addAssertion: Dalek.prototype.addAssertion
};
require('./actions/core-actions.js')(dalek);
require('./assertions/core-assertions.js')(dalek);


module.exports = Dalek;