'use strict';

var helper = require('./helper.js');
var expect = require('chai').expect;

var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

describe('Argument types', function() {
  
  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Assertions.prototype.one;
    
    // register plugins
    dalek.addAction('one', function(done, error, text, number) { log.push('action:one'); done('action:one'); }, {verify: ['string', 'number']});
    dalek.addAssertion('one', function(done, error, text, number) { log.push('assertion:one'); done('assertion:one'); }, {verify: ['string', 'number']});
  });
  
  it('should pass for action', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('action:one');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .one('foobar', 123)
      .done();
  });
  
  it('should fail for action', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    unit._then(helper.message(done, 'ScriptError expected'), helper.error(done));
    
    unit
      .one(123, 'foobar')
      .done();
  });
  
  it('should pass for assertion', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('assertion:one');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .assert.one('foobar', 123)
      .done();
  });
  
  it('should fail for assertion', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    unit._then(helper.message(done, 'ScriptError expected'), helper.error(done));
    
    unit
      .assert.one(123, 'foobar')
      .done();
  });
    
});
