'use strict';

/**
 * @ngdoc directive
 * @name yggdrasilApp.directive:node
 * @description
 * # node
 */
angular.module('yggdrasilApp')
  .directive('node', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the node directive');
      }
    };
  });
