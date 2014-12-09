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
    'base64'
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
      .otherwise({
        redirectTo: '/'
      });
  });
