# DalekJS API Proposal #

This repository is merely a playground for figuring out in which direction the API redesign of DalekJS should go.

By API we don't only understand the public, test-facing side of things, but also how actions, assertions et al are managed internally. If at all possible, the changes proposed herein will *not* reflect on the public API used for actually writing tests (too much).


## Breaking Changes ##

* handling of `.query(selector)...end()` changes to `.query(selector)...end()`
* `Actions` object has become unnecessary (and thus removed)
* registering actions/assertions must be done through proper functions


## Issues to solve ##

* how will assertions access chai functions
  * how should we call these functions?
  * should they be officially registered as well?


## Solved Problems ##

* registering plugins
* removing management overhead from action/assertion plugins
* maintaining a single queue of promises so a simple synchronous chainable test-API can be retained
* allowing sub-chains of actions/assertions
* runtime arguments (for declarative access to buffer, data, etc.)
* plugin-function-independent handling of query context
* basic argument type verification
* conditional context handling

