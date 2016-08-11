/**
 * Created by FanTaSyLin on 2016/8/7.
 */

var app = angular.module('PMSoft', [
    'ngCookies'
]);

app.controller('PMCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
    $scope.username = 'Undefined';
    $scope.username = $cookies.get('username');
}]);