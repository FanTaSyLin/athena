/**
 * Created by FanTaSyLin on 2016/8/5.
 */


'user strict'

var app = angular.module('authentication', [
    'ngStorage',
    'ngRoute',
]);

app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl: 'partials/auth.html',
        controller: 'AuthCtrl'
    });
    $routeProvider.when('/signin', {
        templateUrl: 'partials/signin.html',
        controller: 'AuthCtrl'
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });

}]);