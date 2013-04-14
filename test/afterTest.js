var Assertions = require('unit-test').Assertions,
    Sinon = require('unit-test').Sinon,
    TestCase = require('unit-test').TestCase,
    Callable = require('../src/callable.js');

module.exports = new TestCase("AOP add functions after", {

   setUp: function () {
   },

   tearDown: function () {
   },

   "test functions added to run after an existing one on a given scope do so": function () {
      var original = Sinon.spy(function() { return [].join.call(arguments, ',')});
      var after = Sinon.spy();
      var scope = {fn: original};

      Callable.after(scope, 'fn', after);

      Assertions.assert(original.notCalled, 'Not called before the test starts');
      Assertions.assert(after.notCalled, 'Not called before the test starts');

      Assertions.assertEquals('a,b', scope.fn('a', 'b'), 'Return value is that of the original function');

      Assertions.assert(original.calledOnce, 'Called as usual');
      Assertions.assert(after.calledOnce, 'Called as usual');

      Assertions.assert(original.calledBefore(after), 'Call order is the original first then the aop additions');

      Assertions.assert(original.calledWith('a', 'b'), 'Received all arguments');
      Assertions.assert(after.calledWith('a', 'b', 'a,b'), 'Received all arguments and the result of the original');
   }
});
