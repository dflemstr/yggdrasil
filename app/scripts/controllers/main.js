'use strict';

/**
 * @ngdoc function
 * @name yggdrasilApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yggdrasilApp
 */
angular.module('yggdrasilApp')
  .controller('MainCtrl', function ($scope, db) {
    $scope.rawDb = db.raw;
    $scope.db = db;
  });
