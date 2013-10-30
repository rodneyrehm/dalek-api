'use strict';

var helper = require('./helper.js');
var expect = require('chai').expect;

var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

describe('Query handling', function() {
  
  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Unit.prototype.two;
    delete Dalek.Assertions.prototype.one;
    delete Dalek.Assertions.prototype.two;
    
    // register plugins
    dalek.addAction('one', function(done, error, selector) { log.push('action:one:' + selector); done('action:one:' + selector); }, {query: true});
    dalek.addAction('two', function(done, error, selector) { log.push('action:two:' + selector); done('action:two:' + selector); });
    dalek.addAssertion('one', function(done, error, selector) { log.push('assertion:one:' + selector); done('assertion:one:' + selector); }, {query: true});
    dalek.addAssertion('two', function(done, error, selector) { log.push('assertion:two:' + selector); done('assertion:two:' + selector); });
  });
  
  it('should pass explicit argument', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('action:one:.one|action:two:.two|assertion:one:.one|assertion:two:.two');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .one('.one')
      .two('.two')
      .assert.one('.one')
      .assert.two('.two')
      .done();
  });
  
  it('should pass implicit arguments', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = helper.expect(done, function(buffer) {
      expect(log.join('|')).to.equal('action:one:.query|action:two:.two|assertion:one:.query|assertion:two:.two');
    });
    
    unit._then(completed, helper.notRejected(done));
    unit
      .query('.query')
        .one()
        .two('.two')
        .assert.one()
        .assert.two('.two')
      .done();
  });
  
});
