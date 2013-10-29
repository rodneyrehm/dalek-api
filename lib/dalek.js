'use strict';

var Assertions = require('./assertions.js');
var Unit = require('./unit.js');


function Dalek() {
  
}

Dalek.Unit = Unit;
Dalek.Assertions = Assertions;

Dalek.prototype.addAction = function(name, callback, options) {
  Unit._addAction(name, callback, options);
};

Dalek.prototype.addAssertion = function(name, callback, options) {
  Unit._addAssertion(name, callback, options);
};

Dalek.prototype.loadPlugin = function(globPattern) {
  // TODO: expand globPattern and load files
  // require('./lib/actions/actions-plugin.js')(this);
};

module.exports = Dalek;