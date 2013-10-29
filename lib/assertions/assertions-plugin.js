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
    
    this.getData()
      .then(output.bind(this))
      .then(this.setData.bind(this))
      .then(done)
      .fail(error);

  });
  
};