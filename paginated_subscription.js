PaginatedSubscriptionHandle = function(perPage, initialPages) {
  this.perPage = perPage;
  this.initialPages = initialPages || 1;
  this._pagesLoaded = this.initialPages;
  this._pagesLoadedListeners = new Tracker.Dependency();
  this._limit = this.perPage;
  this._limitListeners = new Tracker.Dependency();
  this._ready = false;
  this._readyListeners = new Tracker.Dependency();
}

PaginatedSubscriptionHandle.prototype.ready = function() {
  this._readyListeners.depend();
  return this._ready;
}

PaginatedSubscriptionHandle.prototype.pagesLoaded = function() {
  this._pagesLoadedListeners.depend();
  return this._pagesLoaded;
}

PaginatedSubscriptionHandle.prototype.limit = function() {
  this._limitListeners.depend();
  return this._limit;
}

// deprecated
PaginatedSubscriptionHandle.prototype.loading = function() {
  return ! this.ready();
}

PaginatedSubscriptionHandle.prototype.loadNextPage = function() {
  this._limit += this.perPage;
  this._pagesLoaded++;
  this._limitListeners.changed();
  this._pagesLoadedListeners.changed();
}

PaginatedSubscriptionHandle.prototype.done = function() {
  this._ready = true;
  this._readyListeners.changed();
}

PaginatedSubscriptionHandle.prototype.reset = function() {
  this._limit = this.initialPages * this.perPage;
  this._pagesLoaded = this.initialPages;
  this._limitListeners.changed();
  this._pagesLoadedListeners.changed();
}


Meteor.subscribeWithPagination = function (/*name, arguments, perPage, initialPages */) {
  var args = Array.prototype.slice.call(arguments, 0);
  var lastArg = args.pop();
  var perPage, initialPages, cb;
  if (_.isFunction(lastArg) || _.isObject(lastArg)) {
    cb = lastArg;
    if(args.length > 1){
      initialPages = args.pop();
      perPage = args.pop();
    }else{
      perPage = args.pop();
    }
  } else {
    if(args.length > 1){
      initialPages = lastArg;
      perPage = args.pop();
    }else{
      perPage = lastArg;
    }
  }
  
  var handle = new PaginatedSubscriptionHandle(perPage, initialPages);
  
  var argAutorun = Meteor.autorun(function() {
    var ourArgs = _.map(args, function(arg) {
      return _.isFunction(arg) ? arg() : arg;
    });
   
    ourArgs.push(handle.limit());
    cb && ourArgs.push(cb);
    var subHandle = Meteor.subscribe.apply(this, ourArgs);
    
    // whenever the sub becomes ready, we are done. This may happen right away
    // if we are re-subscribing to an already ready subscription.
    Meteor.autorun(function() {
      if (subHandle.ready())
        handle.done();
    });
  });
  
  // this will stop the subHandle, and the done autorun
  handle.stop = _.bind(argAutorun.stop, argAutorun);
  
  return handle;
}
