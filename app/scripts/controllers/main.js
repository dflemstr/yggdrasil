'use strict';

/**
 * @ngdoc function
 * @name yggdrasilApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yggdrasilApp
 */
angular.module('yggdrasilApp')
  .controller('MainCtrl', function ($scope, $location, db) {
    $scope.roots = {};

    db.roots().then(function (roots) {
      Object.keys(roots).forEach(function (id) {
        db.updateCollection($scope.roots, roots[id], true);
      });
    });

    $scope.$on('node-change', function (e, node) {
      db.updateCollection($scope.roots, node, !node.parent);
    });

    $scope.add = function () {
      db.add({}).then(function (data) {
        if (data.ok) {
          $location.path('/' + data.id);
        } else {
          console.error('Could not add root', data);
        }
      });
    };

    $scope.remove = function (root) {
      db.remove(root);
    };

    $scope.open = function (root) {
      $location.path('/' + root._id);
    };
  });
