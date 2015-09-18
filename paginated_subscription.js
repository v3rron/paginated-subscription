PaginatedSubscriptionHandle = function(perPage, initialPages) {
  var self = this;
  this.perPage = perPage;
  this.initialPages = initialPages || 1;
  this._ready = false;
  this._limit = this.perPage * this.initialPages;
  this._pagesLoaded = this.initialPages;
  // Listeners
  this._readyListeners = new Tracker.Dependency();
  this._pagesLoadedListeners = new Tracker.Dependency();
  this._limitListeners = new Tracker.Dependency();

  this.pagesLoaded = function() {
    self._pagesLoadedListeners.depend();
    return self._pagesLoaded;
  }

  this.limit = function() {
    self._limitListeners.depend();
    return self._limit;
  }

  this.loadNextPage = function() {
    self._limit += self.perPage;
    self._pagesLoaded++;
    self._limitListeners.changed();
    self._pagesLoadedListeners.changed();
  }

  this.reset = function() {
    self._limit = self.initialPages * self.perPage;
    self._pagesLoaded = self.initialPages;
    self._limitListeners.changed();
    self._pagesLoadedListeners.changed();
  }

  this.ready = function() {
    self._readyListeners.depend();
    return self._ready;
  }

  this.loading = function() {
    self._ready = false;
    self._readyListeners.changed();
  }

  this.done = function() {
    self._ready = true;
    self._readyListeners.changed();
  }
}


Meteor.paginatedSubscribe = function (/* name, publishArgs, options, cb */) {
  var args = Array.prototype.slice.call(arguments, 0);
  
  var lastArg = args.pop();

  var options, cb;
  if (_.isFunction(lastArg)) {
    cb = lastArg;
    options = args.pop();
  } else if(_.isObject(lastArg)) {
    options = lastArg;
  }
  
  if(!options.perPage)
    throw 'Missing option: perPage';

  options.initialPages = options.initialPages || 1;
  
  var handle = new PaginatedSubscriptionHandle(options.perPage, options.initialPages);
  
  var argAutorun = Meteor.autorun(function() {
    var ourArgs = _.map(args, function(arg) {
      return _.isFunction(arg) ? arg() : arg;
    });

    ourArgs.push(handle.limit());
    
    cb && ourArgs.push(cb);

    handle.loading();
    
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
