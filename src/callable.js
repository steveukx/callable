/**
 * @class
 */
(function () {

   "use strict";

   /**
    * Polyfill for bind functionality - as this is in the ECMA5 spec, it is the only feature that is forced
    * onto the prototype of Function. All other features can be added as prototypical extension or used from
    * the Callable namespace.
    * @ignore
    */
   var bind = Function.prototype.bind || function(scope) {
         var originalFunction = this,
             originalArgs;

         if(arguments.length === 1) {
            return function() {
               return originalFunction.apply(scope, arguments);
            }
         }
         else {
            originalArgs = [].slice.call(arguments, 1);
            return function() {
               return originalFunction.apply(scope, originalArgs.concat([].slice.call(arguments)));
            }
         }
      };

   var __cache = {
      delay: [],

      /**
       * Gets the index of the function/scope group in the cache. The returned index will be the index of the function,
       * where the next item in the cache is the scope object and the following one is any arbitrary data pushed into
       * the cache relating to this function/scope combination.
       *
       * @param {String} cache
       * @param {Function} callable
       * @param {Object} scope
       * @return {number}
       */
      indexOf: function(cache, callable, scope) {
         cache = this[cache];
         for(var i = 0, len = cache.length; i < len; i += 3) {
            if(cache[i] === callable && cache[i + 1] === scope) {
               return i;
            }
         }
         return -1;
      },

      /**
       * Gets the data associated with the supplied function/scope pair. If the function/scope pair is not already
       * in the cache, the data retrieved will be null.
       *
       * @param {String} cache
       * @param {Function} callable
       * @param {Object} scope
       * @return {*}
       */
      data: function(cache, callable, scope) {
         var index = this.indexOf(cache, callable, scope);
         if(index < 0) {
            return null;
         }
         else {
            return this[cache][index + 2];
         }
      },

      /**
       * Pushes the supplied data into the named cache at the index supplied (or when omitted to
       * the end of the cache) for the supplied function/scope group.
       *
       * @param {String} cache
       * @param {Function} callable
       * @param {Object} scope
       * @param {Object|Number} [data]
       * @param {Number} [index]
       */
      push: function(cache, callable, scope, data, index) {
         cache = this[cache];

         if(index === undefined || index < 0) {
            index = cache.length;
         }

         cache[index] = callable;
         cache[index + 1] = scope;
         cache[index + 2] = data;
      },

      /**
       * Splices items out of the cache to remove any data associated with the supplied function/scope pair. In
       * the event that the function/scope pair isn't in the cache already, this function has no affect.
       *
       * @param cache
       * @param callable
       * @param scope
       */
      splice: function(cache, callable, scope) {
         var index = this.indexOf(cache, callable, scope);
         if(index >= 0) {
            this[cache].splice(index, 3);
         }
      }
   };

   var Callable = {};

   Callable.attachToPrototype = function() {
      Function.prototype.defer = Callable.defer;
   };

   /**
    * Calls the supplied function in the `timeout` number of milliseconds. The returned function can be called to
    * cancel the `callable` from being called.
    *
    * The `scope` parameter is optional, when omitted the `timeout` should be supplied as the second argument in
    * its place.
    *
    * @param {Function} callable
    * @param {Object} [scope]
    * @param {Number} timeout
    * @return {Function}
    */
   Callable.defer = function(callable, scope, timeout) {
      if(typeof scope === 'number') {
         timeout = scope;
         scope = null;
      }

      var timerId = setTimeout(scope ? bind.call(callable, scope) : callable, timeout);
      return function() {
         clearTimeout(timerId);
      }
   };

   /**
    * Calls the supplied function every `interval` milliseconds for the `repetitions` number of times. If
    * `repetitions` is omitted or set to zero or less then the `callable` is called until cancelled. The `callable`
    * will be called with the iteration count and the current timestamp as arguments.
    *
    * The returned function can be used to prevent the `callable` from being called again.
    *
    * @param {Function} callable
    * @param {Object} [scope]
    * @param {Number} interval
    * @param {Number} [repetitions]
    * @return {Function}
    */
   Callable.repeat = function(callable, scope, interval, repetitions) {
      if('number' == typeof scope) {
         repetitions = interval;
         interval = scope;
         scope = this;
      }

      var iterations = 0;
      var intervalId = setInterval(function() {
         callable.call(scope, iterations++, Date.now());
         if(repetitions > 0 && repetitions <= iterations) {
            clearInterval(intervalId);
         }
      }, interval);

      return function() {
         clearInterval(intervalId);
      }
   };

   /**
    * Requests that the supplied `callable` function be called on the `scope` object in `interval` milliseconds,
    * in the event that another request to call the same function on the same scope object within that time period,
    * the original call will be cancelled in favour of the new one.
    *
    * Using `Callable.delay` can simplify the attaching of handlers to events that fire very rapidly (for example
    * window resizing, scrolling or user input), when it is only once that type of event is complete that the action
    * needs to be taken (ie: essentially this creates `onscrollstop` or `onkeyupwhenwordiscomplete` events).
    *
    * @param {Function} callable
    * @param {Object} scope
    * @param {Number} [interval=50]
    */
   Callable.delay = function(callable, scope, interval) {
      var intervalIndex = __cache.indexOf('delay', callable, scope);
      if(intervalIndex >= 0) {
         clearTimeout(__cache.delay[intervalIndex + 2]);
      }

      __cache.push('delay', callable, scope, setTimeout(function() {
         __cache.splice('delay', callable, scope);
         callable.call(scope);
      }, interval || 50), intervalIndex);
   };

   /**
    * Adds a function to be called after the named function is called on the supplied scope. `Callable.after` can
    * be called multiple times on the same object instance to create an array of functions that should be called in order
    * after the original function is run.
    * To remove the after functions, restore the original by calling `originalFn.restore()`, or use `Callable.restore(originalFn)`
    *
    * @param {Object} scope
    * @param {String} name
    * @param {Function} callable
    */
   Callable.after = function(scope, name, callable) {
      if(typeof scope[name] !== "function") {
         throw new TypeError("Callable.after: object does not have a function named " + name);
      }

      if (scope[name].restore) {
         (scope[name].__after = scope[name].__after || []).push(callable);
      }
      else {
         var original = scope[name];
         var isOwnOriginal = scope.hasOwnProperty(name);

         scope[name] = function() {
            var args = [].slice.call(arguments, 0);
            var returnVal = original.apply(scope, args);
            args.push(returnVal);
            scope[name].__after.forEach(function(after) {
               after.apply(scope, args);
            });
            return returnVal;
         };

         scope[name].restore = function() {
            if(isOwnOriginal) {
               scope[name] = original;
            }
            else {
               delete scope[name];
            }
         };

         scope[name].__after = [callable];
      }

      return scope[name];
   };

   /**
    * Attempts to restore the supplied callable. When the callable supplied is not a function, or doesn't have a restore
    * function, this function has no result.
    *
    * @param {Function} callable
    */
   Callable.restore = function(callable) {
      if(typeof callable == "function" && callable.restore) {
         callable.restore();
      }
   };

   /**
    * Creates a new function that when called will drop any arguments supplied. Useful for cleaning stray arguments from
    * being sent to a callback function.
    *
    * When the optional position argument is supplied, that number of arguments will be forwarded on to the resulting
    * callable.
    *
    * @param {Function} callable
    * @param {Object} [scope]
    * @param {Number} [position=0]
    * @returns {Function}
    */
   Callable.dropArgs = function(callable, scope, position) {
      if(typeof scope === 'number') {
         position = scope;
         scope = null;
      }

      return !isNaN(position) && position ? function() {
         return callable.apply(scope, [].slice.call(arguments, 0, position));
      } : function() {
         return callable.call(scope || this);
      }
   };

   // export for amd loader, node module and browser window scope
   if (typeof define == "function") {
      define("callable", Callable);
   }
   if (typeof module != "undefined") {
      module.exports = Callable;
   }
   if (typeof window != "undefined") {
      window.Callable = Callable;
   }

}());
