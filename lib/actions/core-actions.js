'use strict';

module.exports = function(dalek) {
  
  dalek.addAction('dummy', function (done, error) {
    done();
  });
  
  dalek.addAction('buffer', function buffer(done, error, callback) {
    // this === unit
    if (!callback || typeof callback !== 'function') {
      throw new Error('Action result expects argument callback to be a callable');
    }

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
        }
      })
      .done();
  });
  
  // mocked selenium/exectue
  dalek.addAction('execute', function buffer(done, error, callback) {
    // TODO: callback would be serialized, sent to the browser for execution
    // make sure to pipe the function's response to done() so it ends up in the buffer
    done(callback());
  });
  
};