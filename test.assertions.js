'use strict';

var Dalek = require('./lib/dalek.js');
var dalek = new Dalek();

// TODO: move this to Dalek.prototype.loadPlugin()
require('./lib/actions/actions-plugin.js')(dalek);
require('./lib/assertions/assertions-plugin.js')(dalek);

// run some test
var unit = new Dalek.Unit(dalek);

unit
  .assert.given(1, 1, "one equals one")
  .assert.given(1, 2, "one does not equal two")
  .assert.chain()
    .given(1, 1, "one equals one (chained)")
    .given(1, 2, "one does not equal two (chained)")
    .end()
  .done();