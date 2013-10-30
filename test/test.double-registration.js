'use strict';

var expect = require('chai').expect;
var Dalek = require('../lib/dalek.js');
var dalek = new Dalek();
var unit = new Dalek.Unit(dalek);

describe('foobar', function() {

  it('should exist', function() {
    expect(true).to.be.ok;
  });
  
  it('should lala', function() {
    expect(true).to.be.ok;
  });

  it('should fail', function() {
    expect(false).to.be.ok;
  });

});
