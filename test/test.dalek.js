'use strict';

var expect = require('chai').expect;
var Dalek = require('../lib/dalek.js');

describe('Dalek Infrastructure', function() {

  it('should exist', function() {
    expect(Dalek).to.be.a('function');
  });
  
  it('should know Dalek.Unit', function() {
    expect(Dalek.Unit).to.be.a('function');
  });
  
  it('should know Dalek.Assertions', function() {
    expect(Dalek.Assertions).to.be.a('function');
  });
  
  it('should know core action plugins', function() {
    expect(Dalek.Unit._actions.dummy).to.be.a('function');
  });
  
  it('should know core assertion plugins', function() {
    expect(Dalek.Unit._assertions.dummy).to.be.a('function');
  });
  
  
  // var dalek = new Dalek();
  // var unit = new Dalek.Unit(dalek);

});
