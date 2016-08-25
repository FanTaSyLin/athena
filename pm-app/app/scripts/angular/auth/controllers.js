/**
 * Created by FanTaSyLin on 2016/8/6.
 */

var app = angular.module('Auth');

app.controller('LoginCtrl', ['$cookies', '$scope', 'AuthService', function ($cookies, $scope, AuthService) {

    $scope.credentials = {
        username: '',
        password: ''
    };

    $scope.login = function (credentials) {

        AuthService.login(credentials, function (data, status, headers, config) {

            $cookies.put('username', data.username);
            $cookies.put('token', data.token);


            window.location.href = 'http://localhost:4002/pm-soft';



        }, function (data, status, headers, config) {
            alert('err');
        })
    }

}]);
