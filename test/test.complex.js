'use strict';

var helper = require('./helper.js');
var expect = require('chai').expect;

var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

describe('Complex Plugins', function() {
  
  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Assertions.prototype.one;
    
    // register plugins
    dalek.addAction('one', function (done, error, message) {
      this
        // create a new Unit context
        .pipe(done, error)
        .buffer(function(){ return 'action:hello-world'; })
        // mutate whatever is in unit._result
        .buffer(function(value){ log.push(value); })
        // make sure to end the sub-unit
        .done();
    });
    dalek.addAssertion('one', function (done, error, message) {
      this
        // create a new Unit context
        .pipe(done, error)
        .buffer(function(){ return 'assertion:hello-world'; })
        // mutate whatever is in unit._result
        .buffer(function(value){ log.push(value); })
        // make sure to end the sub-unit
        .done();
    });
  });
  
  it('should run in sequence', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('action:hello-world|assertion:hello-world');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .one()
      .assert.one()
      .done();
  });
    
});
