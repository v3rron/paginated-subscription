# percolate:paginated-subscription

This package is an experiment that adds pagination to Meteor's standard subscriptions. It's a byproduct of the [Telescope project](http://telesc.pe).

## Installation

Install via  [Meteorite](https://github.com/oortcloud/meteorite/):


``` sh
$ meteor add verron:paginated-subscription
```

## Usage

Current Repo is very similar to [paginated-subscription](https://github.com/percolatestudio/paginated-subscription) by Percolate Studio with couple of tweaks and fixes (see below).

Deprecated function ``Deps.autorun`` renamed to ``Tracker.autorun``

This package makes available a single function `Meteor.paginatedSubscribe`. Like the built in `Meteor.subscribe`, it returns a handle, which should be used to keep track of the state of the subscription:

Now you can add ``initialPages`` option in case if you want to load different amount of documents for the first subscribe.

One more API function added ``pagesLoaded()`` in order to see how many pages are currently loaded (it's useful if you want to load the same amount of pages next time you visit same route).

Removed loaded() API function as it didn't make sense (it didn't actually count how many documents were loaded, but was just equal to current limit ).
As a workaround, this scheme can be used:
```js
Template._name.helpers({
  posts: function(){
    var posts = Posts.find({});
    Session.set('postsCount', posts.count());
    return posts;
  }
});
```

Example:

```js
// Abstract
var handle = Meteor.paginatedSubscribe(publishName, publishArguments, options, callback);
```
```js
// Example usage
Template._name.onCreated(function(){
  var tmpl = this;
  tmpl.handle = Meteor.paginatedSubscribe('posts', user_id, {
    perPage: 10, // required
    initialPages: 2 // optional
  }, function(){ // callback optional
    alert('publish ready');
  });
});
```
Or if you use it inside waitOn of Iron-Router
```js
Template._name.onCreated(function(){
  var tmpl = this;
  tmpl.handle = Iron.controller().waitOn();
});
```

The paginated subscription expects you to have a publication setup, as normal, which expects as a final argument the *current* number of documents to display (which will be incremented, in a infinite scroll fashion):

```js
Meteor.publish('posts', function(userId, limit) {
  return Posts.find({user_id: userId}, {limit: limit});
});
```

The important part of all this is the `handle`, which has the following API:

 - `handle.limit()` - how many have we asked for (Reactive)
 - `handle.ready()` - are we waiting on the server right now? (Reactive)
 - `handle.loadNextPage()` - fetch the next page of results (Non-Reactive)
 - `handle.pagesLoaded()` - how many pages been loaded so far (Reactive)

The first three functions are reactive and thus can be used to correctly display an 'infinite-scroll' like list of results.

## TODO

Contributions are heavily encouraged. The obvious things to fix are:

1. Do actual "pagination" rather than "infinite scroll" -- i.e. have an option to pass around an offset as well as limit.
2. Tests, tests, tests

Please contact me if you want to have a go at these and I'll be happy to help in what ways I can.

## License 
MIT. (c) Just Bliss, maintained by Ronen Verdi (@v3rron).

This package was originally forked from Percolate Studio, maintained by Tom Coleman (@tmeasday) and refactored by us.
