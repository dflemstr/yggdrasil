'use strict';

/**
 * @ngdoc function
 * @name yggdrasilApp.controller:NodeCtrl
 * @description
 * # NodeCtrl
 * Controller of the yggdrasilApp
 */
angular.module('yggdrasilApp')
  .controller('NodeCtrl', function ($scope, $routeParams, db) {
    $scope.nodes = db.byId('node/' + $routeParams.id);
  });
