/**
 * Created by FanTaSyLin on 2016/8/6.
 */

var app = angular.module('Auth');

app.factory('AuthService', ['$http', function ($http) {

    var baseUrl = 'http://localhost:4001/api/verify';

    function loginFunc(data, success, error) {

        $http({
            url: baseUrl + '/login',
            method: 'POST',
            params: {
                username: data.username,
                password: data.password
            }
        }).success(success).error(error)

    }


    return {
        login: loginFunc
    }

}]);