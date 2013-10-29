'use strict';

function Assertions(unit) {
  this.unit = unit;
  this.dalek = unit.dalek;
}

Assertions.prototype.queue = function() {
  return this.unit.queue();
};

Assertions.prototype.chain = function() {
  // TODO: move chaining context into unit
  if (this.unit.context === this) {
    throw new Error('Already chaining Assertions');
  }

  this.unit.contextStack.push(this.unit.context);
  this.unit.context = this;
  return this;
};

Assertions.prototype.end = function() {
  // TODO: move chaining context into unit
  if (this.unit.context !== this) {
    throw new Error('Cannot end chaining of Assertions as context does not match');
  }
  
  this.unit.context = this.unit.contextStack.pop();
  return this.unit.context;
};

module.exports = Assertions;