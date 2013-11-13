# DalekJS API Proposal #

This repository is merely a playground for figuring out in which direction the API redesign of DalekJS should go.

By API we don't only understand the public, test-facing side of things, but also how actions, assertions et al are managed internally. If at all possible, the changes proposed herein will *not* reflect on the public API used for actually writing tests (too much). This API is handling plugins and taks scheduling - things we needed to rethink because of the current API's (massive) limitations or create in the first place.

## Breaking Changes ##

* handling of `.query(selector)...end()` changes to `.query(selector)...query()`
* `Actions` object has become unnecessary (and thus removed)
* registering actions/assertions must be done through proper functions


## Issues to solve ##

* how will assertions access chai functions
  * how should we call these functions?
  * should they be officially registered as well?
  * should they access `.buffer` by default?
* how can Assertions be made available in the existing non-Assertion namespaces on top of Unit
* how to integrate in DalekJS (or integrate DalekJS into this API, whatever)
* how assertions (passing/failing) should be handled
  * the current distinction (Error/string) in promise-rejection-handler stinks
* how to make sure user didn't forget to call `.done()`
  * since it's declaration time and considerably fast a simple timeout of 5s should work well?
  * only exception are conditionals, where `.done()` is called asynchronously
* namespacing plugins (similar to `.assert`)
  * `pointer`, `touch`, `wait`, … - provide quite a number of methods
  * can namespacing help solve the problem of ambiguity (`elemen.click` vs. `pointer.click`)
* keeping track of execution-state of declared actions and assertions
  * in order to provide message `123 actions not run because of conditonal`
* assertion `..is.greaterThan(123, "message")` message supposed to name the assertion or provide a message for error?
  * "foo must be above lower bound" vs "foo is below lower bound"
* masking / encapsulating output of a plugin using other plugins
  * `pluginClickExist` encapsulates `.click()` and `.assert.exists()`, are both actions to be logged? 
  * if only the aggregate `pluginClickExist` is logged (and success-tracked), is it a register-time option?
* should plugin content be examined (specifically for `.pipe()` calls)
  * in order to prepare its actions for mapping aggregate/components?

### Action Tracker ###

* `wait.loaded` `wait.ready` to use `execute` to wait for body.onload and DOMContentLoaded respectively

## Solved Problems ##

* registering plugins
* removing management overhead from action/assertion plugins
* maintaining a single queue of promises so a simple synchronous chainable test-API can be retained
* allowing sub-chains of actions/assertions
* runtime arguments (for declarative access to buffer, data, etc.)
* plugin-function-independent handling of query context
* basic argument type verification
* conditional context handling


## API Concepts ##

### Phases ###

* **initialization phase**: the instance when the DalekJS infrastructure itself is set up.
* **registration phase**: the instance a plugin is made available to DalekJS.
* **declaration phase**: the instance when a plugin is registered for invocation (through a *Unit* of a *Suite*).
* **exection phase**: the instance a plugin is really executed.

Core DalekJS plugins are registered automatically immediately after *initialization phase*. Plugins *can* be registered any time after DalekJS initialized - even in the *execution phase* of another plugin. Userspace plugins are most likely registered prior to *declaration phase*. During the *registration phase* plugins are prepared to run as part of DalekJS and made available to instances of `Unit` (action plugins) and `Assertion` (assertion plugins) respectively.

The *declaration phase* incorporates creating an execution plan from the sequence of actions and assertiones a `Unit` contains. At this point no plugin is executed. This stage handles configuring the plugins to run with the proper `.query()` context, building `.conditional()` trees and evaluating *executing context* (pretty much assertion chaining). When contexts are resolved, a declared plugin invokation is put on a queue, waiting for the *execution phase* .

The *execution phase* is entered by calling `.done()` on a `Unit`. At this point the execution plan is run, actions are performed against a browser and assertions are evaluated. Prior to a plugin's execution its input arguments are validated for existence and type if the plugin was registered with the option `{verify: ['type', …]}`.


### Contexts ###

* **execution context**: All plugins are always executed in the context of a *Unit*. For convenience chaining mode can be activated for Assertions, without the assertion plugin ever being aware of this. Plugins can create a new *execution context* internally by calling `.pipe()` - this is required if a plugin wants to use other plugins to compose a complex task.
* **query context**: Instead of repeating the same CSS selector over and over again, `.query(selector)` will make all query-plugins (plguins that were registered with the option `{query: true}`) use the given selector as their first argument. This prevents every plugin from having to check the query context at runtime.
* **conditional context**: using `.conditional()` a set of actions and assertions can be declared to run only in user defined situations. No plugin has knowledge of or access to the *conditional context*.


### Data Passing ###

* The **buffer** (accessible through `.buffer()`) is a temporary storage container used for piping the result of one action into another.
* The **data** map (accessible through `.data()`) is a storage container used for passing data between browser and DalekJS as well as between tests. `Unit`, `Suite` and `Dalek` instance each have their respective *data* map.
* Plugins be told to make use of *buffer* and *data* by way of `RuntimeArgument`.


## API Examples ##

### Declaring A Test Unit ###

```javascript
unit
  .waitForElement('.selector')
  .assert.isGreen('.selector')
  .assert.isRound('.selector')
  .done()
```

can quickly become annoying when lots of actions (e.g. `waitForElement()`) and assertions (e.g. `isGreen()`) are declared. To avoid repetition, a user can enter query and chaining contexts:

```javascript
unit
  // using query to avoid repeating the selector
  .query('.selector')
    .waitForElement()
    // using chaining to avoid repeating .assert
    .assert.chain()
      .isGreen()
      .isRound()
      // eject from assertion chain
      .end()
    // reset the query context
    .query()
  // run the unit
  .done();
```


### Conditional Execution ###

A user will most likely run a Suite against multiple browsers with varying degrees of functionality. To account for this, *conditional contexts* can be used:

```javascript
unit
  .alwaysExecuted()
  // only run a set of plugins if the browser supports transitions
  .conditional(function(){ return 'transition' in document.body.style; })
    .executedDependingUponCondition()
    // leave conditional context
    .conditional()
  .alwaysExecuted()
  // run the unit
  .done();
```

The *query context* carries across `.conditional()` boundaries. A conditional context cannot be entered while assertion chaining is active. Conditions can be nested.


### Using The Buffer ###

```javascript
unit
  // populate the buffer - this could be done by a plugin
  .buffer(function() { return '.selector' })
  // pass the buffer as an argument to a plugin
  .aPlugin(unit.arg("buffer"))
  // run the unit
  .done();
```


### Registering An Action ###

Plugins are treated as asynchronous functions by default. To resolve their state the functions `done` (resolving a promise) and `error` (rejecting a promise) are passed in as the first two arguments. Any arguments following these two were specified in the *declaration phase* or injected prior to *execution phase*

```javascript
module.exports = function(dalek) {
  // register a simple action
  dalek.addAction('pluginName', function(done, error) {
    // do something...
    
    // signal the action has been performed
    done();
    
    // signal the action failed
    error();
  });
  
  // passing data to and from an action
  dalek.addAction('pluginName', function(done, error, arg1, arg2) {
    // do something...
    console.log("action called with", arg1, arg2);
    
    // signal the action has been performed
    // and pass some data to the buffer
    done({
      some: 'data'
    });
    
    // signal the action failed and give a reason
    error('The world is cruel');
    error(new Error('Something serious happened'));
  });
};
```

Plugins can accept selectors to query within the browser. This can either be done in two ways:

```javascript
unit
  // passing a selector directly to the plugin
  .pluginName('.selector', 'Hello World')
  // using the query context to pass the selector
  .query('.selector')
    .pluginName('Hello World')
  // run the unit
  .done();
```

Properly reacting to both declarations can be achieved by registering the plugin with the option `{query: true}`:

```javascript
module.exports = function(dalek) {
  dalek.addAction('pluginName', function(done, error, selector, message) {
    // outputs '.selector, Hello World' in both cases
    console.log(selector, message);
    done();
  }, {query: true});
};
```

A plugin can use other plugins to compose complex tasks:

```javascript
module.exports = function(dalek) {
  dalek.addAction('complexAction', function(done, error) {
    this
      // open a new execution context
      .pipe(done, error)
      // use other plugins
      .one()
      .assert.isGreen()
      .two()
      // execute the context
      .done();
  });
  
  dalek.addAction('one', function(done, error) {
    // do something
    done('one');
  });
  
  dalek.addAction('two', function(done, error) {
    // do something
    done('two');
  });
  
  dalek.addAssertion('isGreen', function(done, error) {
    // do something
    done('isGreen');
  });
};
```

Assertions are registered (and handled) exactly the same as actions.

