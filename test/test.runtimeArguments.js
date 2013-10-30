'use strict';

var helper = require('./helper.js');
var expect = require('chai').expect;

var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

describe('RuntimeArguments', function() {
  
  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Assertions.prototype.one;
    
    // register plugins
    dalek.addAction('one', function(done, error, data) { log.push('action:one:' + data); done('action:one'); });
    dalek.addAssertion('one', function(done, error, data) { log.push('assertion:one:' + data); done('assertion:one'); });
  });
  
  it('should inject buffer', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('action:one:hello-world');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .buffer(function(){ return 'hello-world'; })
      .one(unit.arg('buffer'))
      .done();
  });
    
});
