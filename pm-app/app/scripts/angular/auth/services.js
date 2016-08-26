/**
 * Created by FanTaSyLin on 2016/8/6.
 */

(function () {

    'use strict';

    angular.module('Auth')
        .factory('AuthService', AuthServiceFunc);

    AuthServiceFunc.$inject = ['$http'];

    function AuthServiceFunc($http) {
        //var baseUrl = 'http://123.56.135.196:4001/api';
        var baseUrl = 'http://localhost:4001/api';

        function signInFunc(data, success, error) {
            var body = {
                username: data.username,
                password: data.password
            };

            $http.post(baseUrl + '/user/signin', body).success(success).error(error);
        }

        function loginFunc(data, success, error) {

            $http({
                url: baseUrl + '/verify/login',
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
            signIn: signInFunc,
            login: loginFunc,
            goPMSoft: goPMSoftFunc
        }
    }

})();

/*
var app = angular.module('Auth');

app.factory('AuthService', ['$http', function ($http) {

    var baseUrl = 'http://123.56.135.196:4001/api';
    //var baseUrl = 'http://localhost:4001/api/verify';

    function signInFunc(data, success, error) {
        $http.post(baseUrl + '/user/signin', data).success(success).error(error);
    }

    function loginFunc(data, success, error) {

        $http({
            url: baseUrl + '/verify/login',
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
        signIn: signInFunc,
        login: loginFunc,
        goPMSoft: goPMSoftFunc
    }

}]);
*/