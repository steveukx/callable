var Assertions = require('unit-test').Assertions,
    Sinon = require('unit-test').Sinon,
    TestCase = require('unit-test').TestCase,
    Callable = require('../src/callable.js');

module.exports = new TestCase("Drop arguments in functions", {

   setUp: function () {
   },

   tearDown: function () {
   },

   "test no arguments defaults to dropping all supplied args": function () {
      var original = Sinon.spy();

      Callable.dropArgs(original)('a', 'b', 'c');
      Assertions.assert(original.calledOnce, 'original function called');
      Assertions.assert(original.calledWith(), 'All arguments dropped');
   },

   "test numeric second argument strips up to that many arguments": function () {
      var original = Sinon.spy();

      Callable.dropArgs(original, 1)('a', 'b', 'c');
      Assertions.assert(original.calledOnce, 'original function called');
      Assertions.assert(original.calledWith('a'), 'All arguments dropped');
   },

   "test scope and slice": function () {
      var original = Sinon.spy();
      var scope = {some: 'scope'};

      Callable.dropArgs(original, scope, 1)('a', 'b', 'c');
      Assertions.assert(original.calledOnce, 'original function called');
      Assertions.assert(original.calledOn(scope), 'original function called in supplied scope');
      Assertions.assert(original.calledWith('a'), 'All arguments dropped');
   },

   "test return value is maintained": function () {
      var original = Sinon.spy(function() { return [].join.call(arguments, ','); });
      var result = Callable.dropArgs(original, 2)('a', 'b', 'c');

      Assertions.assertEquals('a,b', result, 'Return value maintained');
   }
});
