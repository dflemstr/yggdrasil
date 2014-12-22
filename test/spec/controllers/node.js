'use strict';

describe('Controller: NodeCtrl', function () {

  // load the controller's module
  beforeEach(module('yggdrasilApp'));

  var NodeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NodeCtrl = $controller('NodeCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
