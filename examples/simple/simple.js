var Posts = new Mongo.Collection("posts");

Posts.sorted = function(limit) {
  return Posts.find({}, {sort: {rank: 1}, limit: limit});
};

if (Meteor.isClient) {
  var subscription = Meteor.subscribeWithPagination("posts", 3);

  Template.posts.helpers({
    posts: function() {
      return Posts.sorted(subscription.loaded());
    },
    loading: function() {
      return !subscription.ready();
    },
    hasMore: function() {
      return Posts.sorted(subscription.loaded()).count() == subscription.limit();
    }
  });

  Template.posts.events({
    'click .js-load-more': function (event) {
      event.preventDefault();

      subscription.loadNextPage();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Posts.find().count() === 0) {
      _.times(13, function(i) {
        Posts.insert({rank: i});
      });
    }
  });

  Meteor.publish("posts", function(limit) {
    return Posts.sorted(limit)
  });
}
