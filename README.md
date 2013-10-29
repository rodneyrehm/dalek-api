# DalekJS API Proposal #

This repository is merely a playground for figuring out in which direction the API redesign of DalekJS should go.

By API we don't only understand the public, test-facing side of things, but also how actions, assertions et al are managed internally. If at all possible, the changes proposed herein will *not* reflect on the public API used for actually writing tests (too much).


## Issues to solve ##

* how will assertions access chai functions
  * how should we call these functions?
  * should they be officially registered as well?
* how can actions/assertions use other actions/assertions in-line
  * possibly create a new `Unit` instance to maintain full API signature - might be overhead
  * instead of synchronous queueing return promises - might be confusing
* how can conditional actions/assertions be integrated
  * possible push everything into a sub-`Unit`?
* how can we improve query() chaining


## Solved Problems ##

* registering plugins
* removing management overhead from action/assertion plugins
* maintaining a single queue of promises so a simple synchronous chainable test-API can be retained

