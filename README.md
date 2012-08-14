# Experimental / Unreleased

# commandful

Reflects [Director](http://github.com/flatiron/director) CLI ( Command Line Interface ) Routers from [resourceful](http://github.com/flatiron/resourceful) resources. Can be used as a stand-alone module or as a [Flatiron](http://github.com/flatiron/) plugin.

# Explanation

The commandful project removes the process of writing boilerplate CLI code for interacting with  [resourceful](http://github.com/flatiron/resourceful) resources. commandful uses <a href="http://en.wikipedia.org/wiki/Reflection_(computer_programming)">reflection</a> to reflect a [Director](http://github.com/flatiron/director) CLI router that maps all routes needed to perform basic [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations with [resourceful](http://github.com/flatiron/resourceful) resources. commandful also has the ability to expose additional arbitrary <a href="#remote">remote resource methods</a> in the routing map.

Through the removal of this boilerplate code, commandful creates a robust, standardized, and re-usable CLI for any [resourceful](http://github.com/flatiron/resourceful) resource.

# Installation

     npm install commandful

# Usage

## As a Flatiron Plugin

To use commandful as a <a href="http://github.com/flatiron/flatiron">Flatiron</a> plugin you will have to:

 - Define resource(s) in your Flatiron app
 - Use the Flatiron `cli` plugin
 - TODO

TODO: Here is a code example of using commandful as a Flatiron plugin: <a href="https://github.com/flatiron/commandful/blob/master/examples/app.js">https://github.com/flatiron/commandful/blob/master/examples/app.js</a>

## As a stand-alone CLI

To use commandful as a stand-alone server you will have to:

 - Define resource(s)
 - Create a new cli router based on the resource(s) using `commandful.createRouter`

TODO: Here is a code example of using commandful as a stand-alone server: <a href="https://github.com/flatiron/commandful/blob/master/examples/server.js">https://github.com/flatiron/commandful/blob/master/examples/server.js</a>

## Core CLI Mappings

TODO:

  By default, `commandful` will map all `Resourceful` methods in the following signature:

```bash
resource action payload
```

**Example:**

```bash
creatures create bob
```

## Relational Resources

To define relational data in commandful you will have to:

 - Define the relationship in the resource itself using the resourceful `Resource.parent()` API
 - Create a new server based on the resource(s)

commandful will then properly reflect the relational properties of your resources into the socket server.

Here is a simple code example of using commandful with `Albums` and `Songs`: <a href="https://github.com/flatiron/commandful/blob/master/examples/server.js">https://github.com/flatiron/commandful/blob/master/examples/server.js</a>

<a name"remote"></a>
## Exposing Arbitrary Resource Methods

In many cases, you'll want to expose additional methods on a Resource through socket.io outside of the included CRUD operations: `create`, `all`, `get`, `update`, `destroy`.

commandful has built in support for easily exposing arbitrary remote resource methods.

Consider the example of a `Creature`. We've already defined all the commandful CRUD events, but a Creature also needs to eat! 

Simply create a new method on the `Creature` resource called `feed`.

```js
Creature.feed = function (_id, options, callback) {
  callback(null, 'I have been fed');
}
```
This `feed` method is consider private by default, in that it will not be exposed to the web unless it's set to a `remote` function. To set a resource method to remote, simply:

```js
Creature.feed.remote = true
```

It's easy as that! By setting the `feed` method to remote, the following events will exist in the `socket.io` server.

```js
socket.emit('creature', 'feed', data, callback)  => Creature.feed()
```

## Resource Security

There are several ways to provide security and authorization for accessing resource methods exposed with commandful. The recommended pattern for authorization is to use resourceful's ability for `before` and `after` hooks. In these hooks, you can add additional business logic to restrict access to the resource's methods. 

**TL;DR; For security and authorization, you should use resourceful's `before` and `after` hooks.**

# Tests

TODO

     npm test

# TODO

 - Add Tests
