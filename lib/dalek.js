'use strict';

var Assertions = require('./assertions.js');
var Unit = require('./unit.js');


function Dalek() {
  
}

Dalek.Unit = Unit;
Dalek.Assertions = Assertions;

Dalek.prototype.addAction = function(name, callback) {
  Unit._addAction(name, callback);
};

Dalek.prototype.addAssertion = function(name, callback) {
  Unit._addAssertion(name, callback);
};

Dalek.prototype.loadPlugin = function(globPattern) {
  // TODO: expand globPattern and load files
  // require('./lib/actions/actions-plugin.js')(this);
};

module.exports = Dalek;