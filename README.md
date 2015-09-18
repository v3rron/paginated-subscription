# percolate:paginated-subscription

This package is an experiment that adds pagination to Meteor's standard subscriptions. It's a byproduct of the [Telescope project](http://telesc.pe).

## Installation

Install via  [Meteorite](https://github.com/oortcloud/meteorite/):


``` sh
$ meteor add verron:paginated-subscription
```

## Usage

This package is very similar to paginated-subscription by (@tmeasday) with couple of differences (see below).

This package makes available a single function `Meteor.paginatedSubscribe`. Like the built in `Meteor.subscribe`, it returns a handle, which should be used to keep track of the state of the subscription:

1. The last argument must be a number, indicating the number of documents per page.
This can be followed by callback functions in style of `Meteor.subscribe`.

Now you can add ``initialPages`` option in case if you want to load different amount of documents for the first subscribe.

One more API function added ``handle.pagesLoaded`` in order to see how many pages are currently loaded (it's useful if you want to load the same amount of pages next time you visit same route).

Removed loaded() API function as it didn't make sense (it didn't actually count how many documents were loaded, but was just equal to current limit ).
As a workaround, this scheme can be used:
```js
var posts = Posts.find({});
Session.set('postsCount', posts.count());
return posts;
```

Example:

```js
// Abstract
var handle = Meteor.paginatedSubscribe(publishName, publishArguments, options, callback);
// Example usage
var handle = Meteor.paginatedSubscribe('posts', user_id, {
  perPage: 10, // required
  initialPages: 2 // optional
}, function(){ // callback optional
  alert('publish ready');
});
```

The paginated subscription expects you to have a publication setup, as normal, which expects as a final argument the *current* number of documents to display (which will be incremented, in a infinite scroll fashion):

```js
Meteor.publish('posts', function(userId, limit) {
  return Posts.find({user_id: userId}, {limit: limit});
});
```

The important part of all this is the `handle`, which has the following API:

 - `handle.limit()` - how many have we asked for
 - `handle.ready()` - are we waiting on the server right now?
 - `handle.loadNextPage()` - fetch the next page of results

The first three functions are reactive and thus can be used to correctly display an 'infinite-scroll' like list of results.

## TODO

Contributions are heavily encouraged. The obvious things to fix are:

1. Do actual "pagination" rather than "infinite scroll" -- i.e. have an option to pass around an offset as well as limit.
2. Tests, tests, tests

Please contact me if you want to have a go at these and I'll be happy to help in what ways I can.

## License 
This package was originally forked from Percolate Studio, maintained by Tom Coleman (@tmeasday) and refactored by us.
MIT. (c) Just Bliss, maintained by Ronen Verdi (@v3rron).
