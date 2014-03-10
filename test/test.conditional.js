'use strict';

var helper = require('./helper.js');
var expect = require('chai').expect;

var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

dalek.events.onAny(function() {
  console.log("event", arguments);
});

dalek.emit("ficken");

describe('Conditional Context', function() {
  
  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Unit.prototype.two;
    delete Dalek.Assertions.prototype.one;
    delete Dalek.Assertions.prototype.two;
    
    // register plugins
    dalek.addAction('one', function(done, error, data) { log.push('action:one'); done('action:one'); });
    dalek.addAction('two', function(done, error, data) { log.push('action:two'); done('action:two'); });
    dalek.addAssertion('one', function(done, error, data) { log.push('assertion:one'); done('assertion:one'); });
    dalek.addAssertion('two', function(done, error, data) { log.push('assertion:two'); done('assertion:two'); });
  });
  
  it('should run in sequence', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
console.log("ficken")
      expect(log.join('|')).to.equal('action:one|action:two|assertion:one|action:two|assertion:two');
      done();
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .conditional(function(){ return true; })
        .one()
        .two()
      .conditional()
        // .assert.one()
      // .conditional()
      // .conditional(function(){ return false; })
      //   .one()
      // .conditional()
      // .two()
      // .assert.two()
      .done();
  });
    
});
