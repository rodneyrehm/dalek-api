'use strict';

var Q = require('q');
var DalekError = require('lib/dalek.error');
//Q.longStackSupport = true;

Q.fcall(function(data) { console.log("first", data); return "hello" })
  .then(function(data) { console.log("second", data); throw new DalekError("asd") })
  .catch(function(data) { console.log("catch",data, data instanceof Error, data instanceof DalekError, data instanceof DriverError); return "world" })
  .then(function(data) { console.log("third", data); })
  .then(
    function(data) { console.log("final success", data); },
    function(data) { console.log("final failure", data); }
  );