# commandful

Reflects [Director](http://github.com/flatiron/director) CLI ( [Command Line Interfaces](http://en.wikipedia.org/wiki/Command-line_interface) ) Routers from [resourceful](http://github.com/flatiron/resourceful) resources. Can be used as a stand-alone module or as a [Flatiron](http://github.com/flatiron/) plugin.

# Explanation

The commandful project removes the process of writing boilerplate CLI code for interacting with  [resourceful](http://github.com/flatiron/resourceful) resources. commandful uses <a href="http://en.wikipedia.org/wiki/Reflection_(computer_programming)">reflection</a> to reflect a [Director](http://github.com/flatiron/director) CLI router that maps all routes needed to perform basic [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations with [resourceful](http://github.com/flatiron/resourceful) resources. commandful also has the ability to expose additional arbitrary <a href="#remote">remote resource methods</a>.

Through the removal of this boilerplate code, commandful creates a robust, standardized, and re-usable CLI experience for any [resourceful](http://github.com/flatiron/resourceful) resource.

# Installation

     npm install commandful

<img src="https://raw.github.com/flatiron/commandful/master/assets/root.png"></img>

## See Also:

- [cli-config](http://github.com/flatiron/cli-config) Flatiron plugin for `config set` and `config get` commands

# Usage

## Define resource(s)

```js

var resourceful = require('resourceful'),
    Creature    = resourceful.define('creature');

Creature.property('type', String, { default: "dragon" });
Creature.property('life', Number, { default: 10 });

```

*[additional API documentation for defining resources](http://github.com/flatiron/resourceful)*

## As a Flatiron Plugin

To use commandful as a <a href="http://github.com/flatiron/flatiron">Flatiron</a> plugin you will have to:

 - Define resource(s) in your Flatiron app
 - Use the Flatiron `cli` plugin
 - Run the app from the command line!

Here is a code example of using commandful as a Flatiron plugin: <a href="https://github.com/flatiron/commandful/blob/master/examples/app.js">https://github.com/flatiron/commandful/blob/master/examples/app.js</a>

## As a stand-alone CLI

To use commandful as a stand-alone server you will have to:

 - Define resource(s)
 - Create a new cli router based on the resource(s) using `commandful.createRouter`

Here is a code example of using commandful as a stand-alone server: <a href="https://github.com/flatiron/commandful/blob/master/examples/simple.js">https://github.com/flatiron/commandful/blob/master/examples/simple.js</a>

## Core CLI Mappings

TODO:

  By default, `commandful` will map all `Resourceful` methods in the following signature:

```bash
<resource> <action>
```

**Example:**

```bash
node bin/simple creature create
```
<img src="https://raw.github.com/flatiron/commandful/master/assets/create.png"></img>

```bash
node bin/simple creature show
```
<img src="https://raw.github.com/flatiron/commandful/master/assets/show.png"></img>

```bash
node bin/simple creature edit
```
<img src="https://raw.github.com/flatiron/commandful/master/assets/edit.png"></img>

<a name"remote"></a>
## Exposing Arbitrary Resource Methods

In many cases, you'll want to expose additional methods on a Resource on the CLI outside of the included CRUD operations: `create`, `list`, `get`, `update`, `destroy`.

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

It's easy as that! By setting the `feed` method to remote, the following events will exist in the CLI.

```bash
node bin/simple creature feed
```

## CLI Customization

Commandful provides access to a `Director.router` object. This router is created by the heavily used [Director](github.com/flatiron/director) library.

If you need to override a generated route, or create an ad-hoc route, or make any customization, the API is *exactly* the same as the Director API.

**customize a reflected router interface:**

```js
app.router.on('foo', function() {
  console.log('custom command');
});
```

Like most of Flatiron's reflection libraries, [commandful](http://github.com/flatiron/commandful) is built to solve 90% of use-cases. If you hit a case where commandful is causing a problem, you can simply drop into `Director`. 

Reflection is *highly* encouraged, but most definitely **optional**.

## Resource Security

There are several ways to provide security and authorization for accessing resource methods exposed with commandful. The recommended pattern for authorization is to use resourceful's ability for `before` and `after` hooks. In these hooks, you can add additional business logic to restrict access to the resource's methods. 

**TL;DR; For security and authorization, you should use resourceful's `before` and `after` hooks.**

# Tests

TODO

     npm test

# TODO

 - Add ability for relational resources
 - Add Tests
 - Add better support for connecting API clients to resources ( for work with remote API servers )
 - Add better error handling ( Resourceful should return more generic errors, looks like couchdb response is being piped in )