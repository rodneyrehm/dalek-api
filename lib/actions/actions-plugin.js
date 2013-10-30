'use strict';

module.exports = function(dalek) {
  
  dalek.addAction('buffer', function buffer(done, error, callback) {
    // this === unit
    if (!callback || typeof callback !== 'function') {
      throw new Error('Action result expects argument callback to be a callable');
    }

    console.log('runnin action buffer');
    this._buffer = callback(this._buffer);
    done(this._buffer);
  });
  
  dalek.addAction('_evaluateConditional', function buffer(done, error, callback) {
    var unit = this;
    this
      // create a new Unit context
      .pipe(done, error)
      .execute(callback)
      .buffer(function(data) {
        if (!data) {
          // reset unit's queue so we resolve the parent queue item immediately
          unit._queue.length = 0;
          console.log('!!! killing queue');
        }
      })
      .done();
  });
  
  // mocked selenium/exectue
  dalek.addAction('execute', function buffer(done, error, callback) {
    console.log('running action execute');
    // TODO: callback would be serialized, sent to the browser for execution
    // make sure to pipe the function's response to done() so it ends up in the buffer
    done(callback());
  });
  
  
  
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