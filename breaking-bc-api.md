# DalekJS API - 6 months later

I've come to the conclusion that a chained API is not necessary, in fact it is making things much more complex than they need be. This document explains a couple of thoughts on what to do if backward compatibility wasn't an issue.

# Action Type Differentiation

We should consider splitting the DalekAPI into two categories: *Navigation* and *Intention*. This separation makes sense once you realize that the navigational components of dalek test suites are ever recurring, but the intentional aspect of a test is, specifically, the actual test.

Say we were testing a [popup dialog](http://api.jqueryui.com/dialog/#entry-examples). A proper test suite would include all variations of closing the dialog, e.g. pressing the key <key>ESC</key>, clicking the close button, clicking the cancel button, clicking the OK button. In order to run this scenario we have to open the test page and wait for it to be loaded exactly once. There is no assertion involved. In order to test the 4 ways to close a dialog, we have to open it 4 times. So the *open dialog and wait for it to be visible*, being the navigational part of this test, is repeated for every assertive component of the test. Even an assertion checking the dialog is really visible requires the same navigation up front.

* **Navigation**: All methods (or use thereof in certain context) that involve things like 
  * opening a page [action]
  * waiting until the page is loaded [reaction]
  * clicking on a button [action]
  * waiting until the button's action is performed [reaction]

* **Intention**: All methods that perform an action that does not change the browser's state
  * taking a screenshot
  * asserting that a component shows a certain text
  * collection the applied CSS selectors of an element

* **Intentional Navigation**: All navigational methods that need to be performed for the intention to execute
  * click on cancel button [intential action]


The intention is the interesting and varying part, as you can see by the repeating `open` calls. To spice things up a couple of different tasks are laid out in the DalekTest "dialog":

```js
// load test page
var init = DalekTest
  .openUrl('example.com')
  .waitForPageReady();
// open the dialog
var open = DalekTest
  .click('#show-dialog')
  .waitForElementVisible('#the-dialog');
// verify dialog title
var assertTitle = DalekTest
  .text('#dialog-title', 'Hello World');
// close the dialog with x
var assertCloseX = DalekTest
  .click('#x-close')
  .waitForElementInvisible('#the-dialog');

// collect and save Telemetry data (only available in Chrome) 
var grabTelemetry = DalekTest
  .telemetry('{test}/opening-dialog.tmd');

// grab a screenshot (only of dialog) for the archives
var takeScreenshot = DalekTest
  .screenshot('#the-dialog', '{test}/dialog.png');

var identifyVisualRegression = DalekTest
  .runVisualRegressionTool('#the-dialog');

DalekTest
  .then(init)
  .then(open)
    .then(grabTelemetry)
    .then(assertTitle)
    .then(takeScreenshot)
    .then(identifyVisualRegression)
    .then(assertCloseX)
  // run the other tests
  .then(open).then(assertCloseCancel);
  .then(open).then(assertCloseOk);
  .then(open).then(assertCloseEscapeKey);
```

### Semantic Phases

The example above would run all the tools in sequence, regardless of them really needing to run at this point. This chain wouldn't help you to run a visual regression only on demand, taking a screenshot on every git push, and functional tests and telemetry collection on every git commit. For this to work we need to introduce *intention types* that can be de/activated by simple CLI switches. From the pattern above we can also identify a separation of registering tasks and putting them in sequence.

```js
Dalek.navigation('open-test-page', function(options) {
  return this.openUrl('example.com').waitForPageReady();
});

Dalek.navigation('open-dialog', function(options) {
  return this
    .click(options.button || '#open-dialog')
    .waitForElementVisible(options.dialog || '#the-dialog', options.timeout || 30);
});

Dalek.phase('test', 'assert-title', function(options) {
  return this.text(options.title || '#dialog-title', options.text || 'Hello World');
});

Dalek.test('closes-with-x', function(options) {
  return this
    .click(options.button || '#x-close')
    .waitForElementInvisible(options.dialog || '#the-dialog', options.timeout || 30);
});

Dalek.phase('screenshot', 'take-screenshot', function(options) {
  return this.screenshot(options.element || '#the-dialog', options.destination || '{test}/dialog.png');
});

Dalek.run([
  'open-test-page',
  'open-dialog',
  'grab-telemetry',
  // static access to registered action
  'assert-title',
  // static access to registered action passing options
  {action: 'take-screenshot', destination: '/dev/null'},
  // dynamic do what you want callback
  function(test){ console.log("yep") },
  // dynamic function that is only run when phase 'happy-world' is active
  {action: function(test){ console.log("we're in phase happy-world"); }, phase: 'happy-world'},
], ['test', 'screenshot']);
```

The `phase` (intention type) could also be used to switch between browser- or test-specific branches. Like accessing the same page on different hosts with slightly different login procedures. If we open the phases up to being augmented (added to) at test runtime, we also have `conditional()` tests covered.

We should also add everything we know about the context to the phase attribute (maybe rename "phase" to "context"?). This includes the browser (e.g. 'browser-chrome', 'browser-chrome-30', 'browser-ie10'). An action can make sure it only runs when all required phases are active by space-separating them: `{action: …, phase: 'screenshot browser-chrome'}`.


## Static Base Actions

As the `Dalek.run()` method takes a list of actions to perform (string for a registered plugin, object for additional config, function for non-sugar-bare-access) we can provide namespaced base actions:

```js
Dalek.run([
  // returns a curried function for convenience
  Dalek.action.click("#some-element"),
  Dalek.wait.elementVisible("#the-element"),
  Dalek.assert.title("#the-element", "The Title"),
  {action: Dalek.assert.title("#the-element", "The Title"), phase: 'happy-world'},
]);
```

## Remembering UI Elements

I very much like the idea behind [Marionette's bindUIElements()](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.view.md#viewbinduielements) where you maintain a map of name/selector pairs and don't have to worry about selecting or re-selecting those elements over and over again.

I would drop the `.query()` method in favor of a test-wide accessible map of elements that are frequently used. That way you also have your selectors centralized and organized.

```js
Dalek.ui({
  someElement: '#some-element'
  allDivs: 'div'
});
Dalek.run([
  // specify a selector
  Dalek.action.click("#some-element"),
  // use a placeholder
  Dalek.action.click(Dalek.ui.someElement),
  // use a collection from which only the first is used
  Dalek.action.click(Dalek.ui.allDivs),
  // thinking from element to action, rather than action with element:
  Dalek.ui.someElement.click(),
]);
```

> Using ES5 getters we would get around the need of having to call a function in test code.

The map could be made a little more complex to allow the author to mark selectors as dynamic or static, in which case WebDriver wouldn't have to re-query a static element over and over again. I'm not sure this is a performance problem, if it's not, I'd drop this idea.


## Under the Hood

As we've gone away from burdening the user with a chained API, we can keep a simple list of actions to perform one after the other. There is no need for wicked promise passing. That means that the simple orchestration of actions can be reduced to the following:

```js
Dalek.test('closes-with-x', function(options) {
  return [
    Dalek.action.click(options.button || "#some-element"),
    Dalek.wait.elementInvisible(options.dialog || '#the-dialog', options.timeout || 30),
  ];
});

// alternative for making a wait know its action, for context, for better error reporting?
Dalek.test('closes-with-x', function(options) {
  return [
    Dalek.action.click(options.button || "#some-element")
      .and()
      .wait.elementInvisible(options.dialog || '#the-dialog', options.timeout || 30),
  ];
});
```

Plugins, the components that expose an action, are a different story. They actually need to return a promise. They also need access to other actions. But they won't need access to the userspace commands (e.g, 'closes-with-x').

This also kills the idea of having dalek user-space and dalek plugin-space look and feel the same. They are neither technically nor logically.


## Defining A Test Suite

Since test suites are read by dalek-cli, we can make namespaces e.g. `Dalek.assert`, `Dalek.action`, etc available through the initialization function:

```js
// file some-test-suite.js
module.exports = function(dalek, assert, action, wait) {
  dalek.test('closes-with-x', function(options) {
    return [
      action.click(options.button || "#some-element"),
      wait.elementInvisible(options.dialog || '#the-dialog', options.timeout || 30),
    ];
  });
  
  var uiElements = {
    someElement: '#some-element'
  };
  
  dalek.suite("name of the suite", uiElements, {
    "name of the test": function(test, ui) {
      return [
        'open-page',
        ui.someElement.click(),
        assert.text(ui.someElement, "Hello World"),
        'closes-with-x',
        {action: 'take-screenshot', phase: 'browser-ie10 screenshot'}
      ]
    };
  });
};
```

## Registering An Assertion Plugin

```js
// file some-plugin.js
module.exports = function(dalek, assert, action, wait) {
  dalek.assert('value', ['element', 'value'], function(options) {
    function validate(element) {
      var assertion = dalek.Assertion("Attribute value of " + element.name + " equals '" + options.value + "'");
      element.getAttribute('value').then(function(_actualValue) {
        if (_actualValue === options.value) {
          assertion.resolve();
        } else {
          assertion.reject("expected '" + options.value + "' but got "' + _actualValue + '"");
        }
      });
      
      return assertion;
    }
    
    return this
      .element(options.element)
      .then(validate);
  });
  
};
```

