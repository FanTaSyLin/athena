/**
 * Created by FanTaSyLin on 2016/8/25.
 */

(function () {

    'use strict';

    angular.module('SignIn')
        .factory('SysConfigService', SysConfigService);

    SysConfigService.$inject = ['$http'];

    const baseUrl = 'http://localhost:4003/api/sysconfig'

    function SysConfigService($http) {

        function getDepartments(successFn, errorFn) {
            $http({
                url: baseUrl + '/department',
                method: 'GET'
            }).success(successFn).error(errorFn);
        }

        return {
            getDepartments: getDepartments
        }
    }

})();