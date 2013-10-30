'use strict';

module.exports = function(dalek) {
    
  dalek.addAction('one', function one(done, error, foo) {
    // this === unit
    console.log('running action one: ' + foo);
    setTimeout(done, 200);
  });

  dalek.addAction('two', function two(done, error) {
    // this === unit
    console.log('running action two');
    setTimeout(done, 100);
  });

  dalek.addAction('errorMessage', function errorMessage(done, error) {
    // this === unit
    console.log('running action three');
    setTimeout(function() {
      error('I am an error message');
    }, 100);
  });

  dalek.addAction('errorException', function errorException(done, error) {
    // this === unit
    console.log('running action errorException');
    error(new Error('reject() Exception'));
  });

  dalek.addAction('typeError', function typeError(done, error) {
    // this === unit
    console.log('running action typeError (throws ReferenceError)');
    foobarbaz++;
  });

  dalek.addAction('getData', function getData(done, error) {
    // this === unit
    console.log('running action getData');
    setTimeout(function() {
      done({
        some: 'data'
      });
    }, 100);
  });
  
  dalek.addAction('setData', function setData(done, error, data) {
    // this === unit
    console.log('running action setData', data);
    setTimeout(function() {
      done();
    }, 100);
  });
  
  dalek.addAction('selectQueryAware', function selectQueryAware(done, error, selector) {
    // this === unit
    console.log('running action selectQueryAware: ' + selector);
    done();
  }, {query: true});
  
  dalek.addAction('selectQueryUnaware', function selectQueryUnaware(done, error, selector) {
    // this === unit
    console.log('running action selectQueryUnaware: ' + selector);
    done();
  }, {query: false});
  
  dalek.addAction('verifyArguments', function verifyArguments(done, error, text, number) {
    // this === unit
    console.log('running action verifyArguments');
    done();
  }, {verify: ['string', 'number']});
};