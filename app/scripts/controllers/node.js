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
    var id = 'node/' + $routeParams.id;

    $scope.node = null;
    db.byId(id).then(function (node) {
      $scope.node = node;
    });

    $scope.$on('node-change', function (e, node) {
      if (node._id === id) {
        $scope.node = node;
      }
    });
  });
