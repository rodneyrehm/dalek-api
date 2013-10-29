'use strict';

module.exports = function(dalek) {
  
  dalek.addAssertion('given', function (done, error, givenValue, expectedValue, message) {
    // this === unit
    console.log("running assertion given");
    if (givenValue === expectedValue) {
      setTimeout(done, 100);
    } else {
      error(message);
    }
  });

  dalek.addAssertion('data', function (done, error, message) {
    // this === unit
    console.log("running assertion getData");
    
    var output = function(data) {
      console.log("data is here", data);
      return data.some;
    };
    
    this
      // create a new Unit context
      .pipe(done, error)
      .getData()
      // mutate whatever is in unit._result
      .buffer(output)
      // make sure to end the sub-unit
      .done();
  });
  
};