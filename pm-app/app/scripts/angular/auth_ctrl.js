/**
 * Created by FanTaSyLin on 2016/8/6.
 */

var app = angular.module('Auth');

app.controller('LoginCtrl', ['$scope', 'AuthService', function ($scope, AuthService) {

    $scope.credentials = {
        username: '',
        password: ''
    };

    $scope.login = function (credentials) {

        AuthService.login(credentials, function (data, status, headers, config) {

            window.location.href = 'http://localhost:4002/pm-soft/'

        }, function (res) {

        })
    }

}]);
