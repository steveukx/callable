callable
========

Higher order functions for working with functions in JavaScript.

Download and installation
=========================

To use in a [node.js](http://nodejs.org) app, install through `npm` command:

    npm install fn-callable

To use in a browser, just download the `src/callable.js` script and you're good to go. Callable is also compatible with
AMD style loaders that use `define` for declaring modules.

Usage
=====

Simplify calls to setting timeouts:

    /**
     * Call someFunction with someScope as the scope in timerDelay milliseconds
     */
    Callable.defer(someFunction, someScope, timerDelay);

Cancelling the timeout uses the returned function from `Callable.defer`:

    // defer doing something for one second
    this._cancelDoingSomething = Callable.defer(this.doSomething, this, 1000);

    // if at some point between now and that one second you decide not to do it
    this._cancelDoingSomthing();

Simplify calls to setting intervals:

    /**
     * Call someFunction with someScope as the scope ever intervalDelay milliseconds
     * for iterationCount iterations - zero or smaller as iteration count is infinitely
     */
    Callable.repeat(someFunction, someScope, intervalDelay, iterationCount);

Intervals are cancelled in the same way as timeouts, by calling the function that they return.

Grouping execution of functions - a nifty trick to run a function only once it has stopped being called,
an example use case would be where functions are attached as event handlers that might fire a few hundred
times, but only have to do work once they stop being called (such as window resizing etc).

    /**
     * Calls someFunction in the scope of someScope after maxDelay seconds. If the same function/scope
     * combination are used within that time, the original request is discarded and a new delay is set
     * up, so the function only gets called once.
     */
    Callable.delay(someFunction, someScope, maxDelay);

An example of `Callable.delay` in action:

    function resizeHandler() {
       alert('resized');
    }

    jQuery(window).on('resize', function() {
       Callable.delay(resizeHandler, this, 10);
    });

Using `Callable.delay` in the callback for the window resize event means the `resizeHandler` function will
only be called once rather than for each pixel change (particularly a problem in old Internet Explorer).

Add AOP style callbacks to be run immediately after another funciton has run. In order for Callable to be able to add
the callback, this will only work on non-anonymous functions, and as it is a name based replacement, any existing references
to the function that is being observed will not call the AOP callbacks.

Those caveats aside, it's easy to observe a class instance method:

    function SomeClass() {}
    SomeClass.prototype.someMethod = function() {};

    var someClass = new SomeClass();
    Callable.after(someClass, 'someMethod', function() {});

... or even a method on the prototype, to be observed when any instance calls it:

    function SomeClass() {}
    SomeClass.prototype.someMethod = function() {};

    Callable.after(SomeClass.prototype, 'someMethod', function() {});

AOP callbacks can be added multiple times to the same function without significant memory penalties as all AOP is held
in one object per scope/function pair.
