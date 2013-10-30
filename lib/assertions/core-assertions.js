'use strict';

module.exports = function(dalek) {
  
  dalek.addAssertion('dummy', function (done, error) {
    done();
  });
  
};