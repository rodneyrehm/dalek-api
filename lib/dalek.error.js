'use strict';

function DalekError() {
  Error.apply(this, arguments);
}

DalekError.prototype = new Error();
DalekError.prototype.constructor = MyError;
DalekError.prototype.name = 'DalekError';

module.exports = DalekError;