'use strict';

var Dalek = require('./lib/dalek.js');
var dalek = new Dalek();

// TODO: move this to Dalek.prototype.loadPlugin()
require('./lib/actions/actions-plugin.js')(dalek);
require('./lib/assertions/assertions-plugin.js')(dalek);

// run some test
var unit = new Dalek.Unit(dalek);
unit
  // .selectQueryAware('.selectQueryAware')
  // .selectQueryUnaware('.selectQueryUnaware')
  // .assert.testQueryAware('.testQueryAware', '.testQueryAware')
  // .assert.testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
  // .query('.query')
  //   .selectQueryAware('.selectQueryAware')
  //   .selectQueryUnaware('.selectQueryUnaware')
  //   .assert.testQueryAware('.query')
  //   .assert.testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
  //   .query()
  // .selectQueryAware('.selectQueryAware')
  // .selectQueryUnaware('.selectQueryUnaware')
  // .assert.testQueryAware('.testQueryAware', '.testQueryAware')
  // .assert.testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
  .query('.query')
    .assert.chain()
      .testQueryAware('.query')
      .testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
      .query()
        .testQueryAware('.testQueryAware', '.testQueryAware')
        .testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
      .query('.queryInner')
        .testQueryAware('.queryInner')
        .testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
      .end()
    .assert.testQueryAware('.queryInner')
    .assert.testQueryUnaware('.testQueryUnaware', '.testQueryUnaware')
  .done();