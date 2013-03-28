
var Assertions = require('unit-test').Assertions,
    Sinon = require('unit-test').Sinon,
    TestCase = require('unit-test').TestCase,
    Callable = require('../src/callable.js');

var Clock;

module.exports = new TestCase("Delayed Calls", {

   setUp: function() {
      Clock = Sinon.useFakeTimers();
   },

   tearDown: function() {
      Clock.restore();
   },

   "test delayed calls are not called synchronously": function() {
      var spy = Sinon.spy();
      Callable.defer(spy, 1);

      Assertions.assert(spy.notCalled);

      Clock.tick(1);
      Assertions.assert(spy.calledOnce);
   },

   'test delayed calls are scheduled in milliseconds': function() {
      var spy = Sinon.spy();
      Callable.defer(spy, 100);

      Assertions.assert(spy.notCalled, 'Not called immediately');

      Clock.tick(99);
      Assertions.assert(spy.notCalled, 'Not called after almost all time elapsed');

      Clock.tick(101);
      Assertions.assert(spy.calledOnce, 'Called once all time is elapsed');
   },

   'test delayed calls can be run in a custom scope': function() {
      var spy = Sinon.spy();
      var customScope = {some: 'scope'};

      Callable.defer(spy, customScope, 100);

      Assertions.assert(spy.notCalled, 'Not called immediately');

      Clock.tick(100);
      Assertions.assert(spy.calledOnce, 'Called once the time has elapsed');
      Assertions.assert(spy.calledOn(customScope), 'Called on the specific scope');
   },

   'test delayed calls can be canceled': function() {
      var spy = Sinon.spy();
      var cancel = Callable.defer(spy, 100);

      cancel();
      Clock.tick(100);
      Assertions.assert(spy.notCalled, 'Not called even though the time has elapsed');
   }
});
