'use strict';

/**
 * @ngdoc directive
 * @name yggdrasilApp.directive:dbRepeat
 * @description
 * # dbRepeat
 */
angular.module('yggdrasilApp')
  .directive('dbRepeat', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the dbRepeat directive');
      }
    };
  });
