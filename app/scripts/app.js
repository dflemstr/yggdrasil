'use strict';

/**
 * @ngdoc overview
 * @name yggdrasilApp
 * @description
 * # yggdrasilApp
 *
 * Main module of the application.
 */
angular
  .module('yggdrasilApp', [
    'ngAnimate',
    'ngRoute',
    'ngTouch',
    'pouchdb',
    'ab-base64',
    'angular-medium-editor',
    'RecursionHelper'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/node/:id', {
        templateUrl: 'views/node.html',
        controller: 'NodeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
