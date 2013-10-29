'use strict';

var Dalek = require('./lib/dalek.js');
var dalek = new Dalek();

// TODO: move this to Dalek.prototype.loadPlugin()
require('./lib/actions/actions-plugin.js')(dalek);
require('./lib/assertions/assertions-plugin.js')(dalek);

// run some test
var unit = new Dalek.Unit(dalek);
unit
  .verifyArguments("string", 123)
  .verifyArguments(123, "string")
  .done();