'use strict';

function RuntimeArgument(type, options) {
  this.type = type;
  this.options = options || {};
  
  if (!RuntimeArgument.toValue[this.type]) {
    throw new Error('Unknown RuntimeArgument type "' + this.type + '"');
  }
}

RuntimeArgument.prototype.toValue = function(unit) {
  console.log('RuntimeArgument to Value');
  return RuntimeArgument.toValue[this.type](unit, this.options);
};

RuntimeArgument.toValue = {
  buffer: function(unit, options) {
    console.log('read buffer', unit._buffer);
    return unit._buffer;
  },

  data: function(unit, options) {
    // FIXME: accessing a unit's shared data store
    // options.scope is one of ['unit', 'suite', 'dalek'] defaulting to 'unit'
    // options.key is the name of the data property
    return undefined;
  }
};

module.exports = RuntimeArgument;