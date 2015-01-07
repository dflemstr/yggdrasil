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
        $scope.children = {};

        // TODO: $scope.$watch
        db.children($scope.node).then(function (children) {
          Object.keys(children).forEach(function (id) {
            db.updateCollection($scope.children, children[id], true);
          });
        });

        $scope.$on('node-change', function (e, node) {
          db.updateCollection($scope.children, node, node.parent && node.parent === $scope.node._id);
        });

        $scope.save = function () {
          db.save($scope.node);
        };

        $scope.addChild = function () {
          var after = undefined;
          var maxWeight = 0;
          Object.keys($scope.children).forEach(function (id) {
            var child = $scope.children[id];
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
