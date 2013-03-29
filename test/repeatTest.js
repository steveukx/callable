
var Assertions = require('unit-test').Assertions,
    Sinon = require('unit-test').Sinon,
    TestCase = require('unit-test').TestCase,
    Callable = require('../src/callable.js');

var Clock, spy;

module.exports = new TestCase("Repeat Calls", {

   setUp: function() {
      Clock = Sinon.useFakeTimers();
      spy = Sinon.spy();
   },

   tearDown: function() {
      spy = null;
      Clock.restore();
   },

   "test repeat calls are not called synchronously": function() {
      Callable.repeat(spy, 10);

      Assertions.assert(spy.notCalled);

      Clock.tick(10);
      Assertions.assert(spy.calledOnce);

      Clock.tick(5);
      Assertions.assert(spy.calledOnce);

      Clock.tick(5);
      Assertions.assert(spy.calledTwice);
   },

   'test repeat calls can have a maximum number of iterations': function() {
      Callable.repeat(spy, 10, 2);

      for(var results = [1, 2, 2], i = 0; i < results.length; i++) {
         Clock.tick(10);
         Assertions.assertEquals(spy.callCount, results[i], 'Repeated function should have a maximum repetition count');
      }
   },

   'test repeat calls can be run in a custom scope': function() {
      var customScope = {some: 'scope'};

      Callable.repeat(spy, customScope, 10);

      Clock.tick(10);
      Assertions.assert(spy.calledOnce, 'Called once the time has elapsed');
      Assertions.assert(spy.calledOn(customScope), 'Called on the specific scope');
      Assertions.assert(spy.calledWith(0, 10), 'Called with the zero based iteration number and the current time #1');

      Clock.tick(10);
      Assertions.assert(spy.calledWith(1, 20), 'Called with the zero based iteration number and the current time #2');
   },

   'test delayed calls can be canceled before running': function() {
      var cancel = Callable.repeat(spy, 10);

      cancel();
      Clock.tick(10);
      Assertions.assert(spy.notCalled, 'Not called even though the time has elapsed');
   },

   'test delayed calls can be canceled whilst running': function() {
      var cancel = Callable.repeat(spy, 10);

      Clock.tick(10);
      Assertions.assert(spy.calledOnce, 'Was called before canceled');

      cancel();
      Clock.tick(10);
      Assertions.assert(spy.calledOnce, 'Was not called after cancelling');
   }
});
