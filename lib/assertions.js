'use strict';

function Assertions(unit) {
  this.unit = unit;
  this.dalek = unit.dalek;
}

Assertions.prototype.queue = function() {
  return this.unit.queue();
};

Assertions.prototype.query = function(query) {
  return this.unit.query(query);
};

Assertions.prototype.chain = function() {
  return this.unit.pushContext(this, 'Already chaining Assertions');
};

Assertions.prototype.end = function() {
  return this.unit.popContext(this, 'Cannot end chaining of Assertions as context does not match');
};

module.exports = Assertions;