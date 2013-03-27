
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
   }
});
