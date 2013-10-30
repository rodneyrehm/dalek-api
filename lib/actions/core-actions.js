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
  
};