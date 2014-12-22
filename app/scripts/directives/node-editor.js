'use strict';

/**
 * @ngdoc directive
 * @name yggdrasilApp.directive:node
 * @description
 * # node
 */
angular.module('yggdrasilApp')
  .directive('nodeEditor', function (db, RecursionHelper) {
    return {
      templateUrl: 'views/node-editor.html',
      restrict: 'E',
      scope: {
        node: '=',
        depth: '&'
      },
      compile: function (element) {
        return RecursionHelper.compile(element);
      },
      controller: function ($scope) {
        $scope.children = db.children($scope.node);
        $scope.save = function () {
          db.save($scope.node);
        };
        $scope.addChild = function () {
          var after = undefined;
          var maxWeight = 0;
          var keys = Object.keys($scope.children);

          keys.forEach(function (key) {
            var child = $scope.children[key];
            if (child.weight > maxWeight) {
              after = child;
              maxWeight = child.weight;
            }
          });
          db.add({parent: $scope.node._id}, after);
        };
        $scope.remove = function () {
          db.remove($scope.node);
        };
        $scope.childCount = function () {
          return Object.keys($scope.children).length;
        };
      }
    };
  });
