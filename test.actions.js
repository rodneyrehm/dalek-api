'use strict';

var Dalek = require('./lib/dalek.js');
var dalek = new Dalek();

// TODO: move this to Dalek.prototype.loadPlugin()
require('./lib/actions/actions-plugin.js')(dalek);
require('./lib/assertions/assertions-plugin.js')(dalek);

// run some test
var unit = new Dalek.Unit(dalek);

unit
  .one('foo bar')
  .two()
  .errorMessage()
  .errorException()
  .typeError()
  .done();