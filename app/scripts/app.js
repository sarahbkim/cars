'use strict';

/**
 * @ngdoc overview
 * @name carsApp
 * @description
 * # carsApp
 *
 * Main module of the application.
 */
angular
  .module('carsApp', [
    // 'ngAnimate',
    // 'ngCookies',
    'ngResource',
    'ngRoute',
    // 'ngSanitize',
    // 'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  });