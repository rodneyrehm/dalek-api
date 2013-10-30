'use strict';

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
  return this
    ._loadPlugin('./actions/core-actions.js')
    ._loadPlugin('./assertions/core-assertions.js');
};

module.exports = Dalek;