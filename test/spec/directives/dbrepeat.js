'use strict';

describe('Directive: dbRepeat', function () {

  // load the directive's module
  beforeEach(module('yggdrasilApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<db-repeat></db-repeat>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dbRepeat directive');
  }));
});
