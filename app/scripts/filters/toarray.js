'use strict';

/**
 * @ngdoc filter
 * @name yggdrasilApp.filter:toArray
 * @function
 * @description
 * # toArray
 * Filter in the yggdrasilApp.
 */
angular.module('yggdrasilApp')
  .filter('toArray', function () {
    return function (obj) {
      if (!(obj instanceof Object)) {
        return obj;
      }

      return Object.keys(obj).map(function (key) {
        return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
      });
    }
  });
