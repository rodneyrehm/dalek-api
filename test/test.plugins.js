'use strict';

var expect = require('chai').expect;
var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var log = [];

describe('Plugin Registration', function() {

  before(function() {
    // clean plugins
    delete Dalek.Unit.prototype.one;
    delete Dalek.Unit.prototype.two;
    delete Dalek.Unit.prototype.scriptError;
    delete Dalek.Assertions.prototype.one;
    delete Dalek.Assertions.prototype.two;
    delete Dalek.Assertions.prototype.scriptError;
  });

  it('should accept actions', function() {
    expect(Dalek.Unit.prototype.one).to.be.undefined;
    expect(Dalek.Unit.prototype.two).to.be.undefined;
    
    dalek.addAction('one', function(done, error) { log.push('action:one'); done('action:one'); }, {});
    dalek.addAction('two', function(done, error, message) { log.push('action:two:' + message); done('action:two:' + message); });
    
    expect(Dalek.Unit.prototype.one).to.be.a('function');
    expect(Dalek.Unit.prototype.two).to.be.a('function');
    expect(Dalek.Unit._actions.one).to.be.a('function');
    expect(Dalek.Unit._actions.two).to.be.a('function');
  });
  
  it('should accept assertions', function() {
    expect(Dalek.Assertions.prototype.one).to.be.undefined;
    expect(Dalek.Assertions.prototype.two).to.be.undefined;
    
    dalek.addAssertion('one', function(done, error) { log.push('assertion:one'); done('assertion:one'); });
    dalek.addAssertion('two', function(done, error, message) { log.push('assertion:two:' + message); done('assertion:two:' + message); });
    
    expect(Dalek.Assertions.prototype.one).to.be.a('function');
    expect(Dalek.Assertions.prototype.two).to.be.a('function');
    expect(Dalek.Unit._actions.one).to.be.a('function');
    expect(Dalek.Unit._actions.two).to.be.a('function');
  });
  
  it('should reject duplicate actions', function() {

    try {
      dalek.addAction('one', function(){});
    } catch(e) {
      return;
    }
    
    expect(false).to.be.ok;
  });
  
  it('should reject duplicate assertions', function() {

    try {
      dalek.addAssertion('one', function(){});
    } catch(e) {
      return;
    }
    
    expect(false).to.be.ok;
  });
  
  it('should run in sequence', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = function(buffer) {
      try {
        expect(log.join('|')).to.equal('action:one|action:two:foo|assertion:one|assertion:two:bar');
        done();
      } catch(error) {
        done(error);
      }
    };

    unit._then(completed, done);
    unit
      .one()
      .two('foo')
      .assert.one()
      .assert.two('bar')
      .done();
  });
  
  it('should support chaining assertions', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    var unit = new Dalek.Unit(dalek);
    var completed = function(buffer) {
      try {
        expect(log.join('|')).to.equal('assertion:one|assertion:two:bar');
        done();
      } catch(error) {
        done(error);
      }
    };

    unit._then(completed, done);
    unit
      .assert.chain()
        .one()
        .two('bar')
      .end()
      .done();
  });
  
  it('should fail for unknown actions', function() {
    var unit = new Dalek.Unit(dalek);

    try {
      unit
        .unknownAction()
        .done();
    } catch(e) {
      return;
    }
    
    expect(false).to.be.ok;
  });
  
  it('should fail for unknown assertions', function() {
    var unit = new Dalek.Unit(dalek);

    try {
      unit
        .assert.unknownAssertion()
        .done();
    } catch(e) {
      return;
    }
    
    expect(false).to.be.ok;
  });
  
  it('should fail for script errors in actions', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    dalek.addAction('scriptError', function(){ undefinedVariableAccess++; });
    
    var unit = new Dalek.Unit(dalek);
    var completed = function(_error) {
      try {
        expect(_error.message).to.be.ok;
        done();
      } catch(error) {
        done(error);
      }
    };
    var error = function() {
      done(new Error('ScriptError must reject unit'));
    };

    unit._then(error, completed);
    unit
      .scriptError()
      .one()
      .done();
  });
  
  it('should fail for script errors in assertions', function(done) {
    log.length = 0;
    expect(log.join('|')).to.equal('');
    
    dalek.addAssertion('scriptError', function(){ undefinedVariableAccess++; });
    
    var unit = new Dalek.Unit(dalek);
    var completed = function(_error) {
      try {
        expect(_error.message).to.be.ok;
        done();
      } catch(error) {
        done(error);
      }
    };
    var error = function() {
      done(new Error('ScriptError must reject unit'));
    };

    unit._then(error, completed);
    unit
      .assert.scriptError()
      .one()
      .done();
  });
});
