PaginatedSubscriptionHandle = function(perPage) {
  var self = this;
  self.perPage = perPage;
  self._limit = perPage;
  self._limitListeners = new Tracker.Dependency();
  self._loaded = 0;
  self._loadedListeners = new Tracker.Dependency();
  
  console.log('HERE')
  Tracker.onInvalidate(function() {
    console.log('IN HERE')
    self._stop();
  });
}

PaginatedSubscriptionHandle.prototype.loaded = function() {
  this._loadedListeners.depend();
  return this._loaded;
}

PaginatedSubscriptionHandle.prototype.limit = function() {
  this._limitListeners.depend();
  return this._limit;
}

PaginatedSubscriptionHandle.prototype.ready = function() {
  return this.loaded() === this.limit();
}

// deprecated
PaginatedSubscriptionHandle.prototype.loading = function() {
  return ! this.ready();
}

PaginatedSubscriptionHandle.prototype.loadNextPage = function() {
  this._limit += this.perPage;
  this._limitListeners.changed();
}

PaginatedSubscriptionHandle.prototype.done = function() {
  this._loaded = this._limit;
  this._loadedListeners.changed();
}

PaginatedSubscriptionHandle.prototype.reset = function() {
  this._limit = this.perPage;
  this._limitListeners.changed();
}

PaginatedSubscriptionHandle.prototype._stop = function() {
  this._limitListeners.changed();
  this._loadedListeners.changed();
}


Meteor.subscribeWithPagination = function (/*name, arguments, perPage */) {
  var args = Array.prototype.slice.call(arguments, 0);
  var lastArg = args.pop();
  var perPage, cb;
  if (_.isFunction(lastArg) || _.isObject(lastArg)) {
    cb = lastArg; 
    perPage = args.pop();
  } else {
    perPage = lastArg;
  }
  
  var handle = new PaginatedSubscriptionHandle(perPage);
  handle._args = args;
  
  var argAutorun = Tracker.autorun(function() {
    var ourArgs = _.map(args, function(arg) {
      return _.isFunction(arg) ? arg() : arg;
    });
   
    ourArgs.push(handle.limit());
    cb && ourArgs.push(cb);
    var subHandle = Meteor.subscribe.apply(this, ourArgs);
    
    // whenever the sub becomes ready, we are done. This may happen right away
    // if we are re-subscribing to an already ready subscription.
    Tracker.autorun(function() {
      if (subHandle.ready())
        handle.done();
    });
  });
  
  // this will stop the subHandle, and the done autorun
  handle.stop = function() {
    argAutorun.stop();
    handle._stop();
  };
  
  return handle;
}
