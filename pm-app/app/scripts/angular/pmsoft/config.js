/**
 * Created by FanTaSyLin on 2016/8/7.
 */

var app = angular.module('PMSoft', [
    'ngCookies',
    'ngStorage'
]);

app.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};

    $httpProvider.interceptors.push('Interceptor');


}]);