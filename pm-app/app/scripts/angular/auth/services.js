/**
 * Created by FanTaSyLin on 2016/8/6.
 */

var app = angular.module('Auth');

app.factory('AuthService', ['$http', function ($http) {

    var baseUrl = 'http://123.56.135.196:4001/api/verify';
    //var baseUrl = 'http://localhost:4001/api/verify';

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

    function goPMSoftFunc(successFn, errorFn) {
        $http.get('http://localhost:4002/pm-soft').success(successFn).error(errorFn);
    }


    return {
        login: loginFunc,
        goPMSoft: goPMSoftFunc
    }

}]);