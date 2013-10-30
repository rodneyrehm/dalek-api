'use strict';

module.exports = function(dalek) {
  
  dalek.addAssertion('given', function (done, error, givenValue, expectedValue, message) {
    // this === unit
    console.log('running assertion given');
    if (givenValue === expectedValue) {
      setTimeout(done, 100);
    } else {
      error(message);
    }
  });

  dalek.addAssertion('data', function (done, error, message) {
    // this === unit
    console.log('running assertion getData');
    
    var output = function(data) {
      console.log('data is here', data, message);
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
  
  dalek.addAssertion('testQueryAware', function (done, error, selector, expectedValue, message) {
    // this === unit
    console.log('running assertion testQueryAware');
    if (selector === expectedValue) {
      setTimeout(done, 100);
    } else {
      error(message);
    }
  }, {query: true});

  dalek.addAssertion('testQueryUnaware', function (done, error, selector, expectedValue, message) {
    // this === unit
    console.log('running assertion testQueryUnaware');
    if (selector === expectedValue) {
      setTimeout(done, 100);
    } else {
      error(message);
    }
  }, {query: false});
};