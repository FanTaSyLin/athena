/**
 * Created by FanTaSyLin on 2016/8/25.
 */

(function () {

    'use strict';

    angular.module('SignIn')
        .factory('SignInService', SignInService);

    SignInService.$inject = ['$http'];

    const baseUrl = 'http://123.56.135.196:4003/api'

    function SignInService($http) {

        function getDepartments(successFn, errorFn) {
            $http({
                url: baseUrl + '/sysconfig/department',
                method: 'GET'
            }).success(successFn).error(errorFn);
        }

        function userInfoSignIn(body, successFn, errorFn) {
            $http.post(baseUrl + '/userinfo', body).success(successFn).error(errorFn);
        }

        return {
            getDepartments: getDepartments,
            userInfoSignIn: userInfoSignIn
        }
    }

})();