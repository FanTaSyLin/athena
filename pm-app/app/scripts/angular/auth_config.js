/**
 * Created by FanTaSyLin on 2016/8/7.
 */

var app = angular.module('Auth', [
    'ngRoute'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {

    $routeProvider.when('/', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.when('/signin', {
        templateUrl: 'partials/signin.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });

    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.

    $locationProvider.html5Mode(true);

}]);