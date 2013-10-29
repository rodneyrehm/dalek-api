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
    this.getData();
    setTimeout(done, 100);
    // } else {
    //   error(message);
    // }
  });
  
};