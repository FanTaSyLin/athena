/**
 * Created by FanTaSyLin on 2016/8/4.
 */


var app = angular.module('login-signin')

app.factory('AuthService', ['$http', function ($http) {

    var baseUrl = 'http://localhost:4001/api/verify';

    var authService = {};

    authService.login = function (user, successFunc, errorFunc) {

        $http({
            url: baseUrl + '/login',
            method: 'GET',
            params: {
                username : user.username,
                password : user.password
            }
        }).success(successFunc).error(errorFunc);

    }

    return authService;

}]);