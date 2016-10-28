/**
 * Created by FanTaSyLin on 2016/8/23.
 */
(function () {
    
    'use strict';
    
    angular.module('SysConfig')
        .factory('SysConfigService', SysConfigService);
    
    SysConfigService.$inject = ['$http'];

    //const baseUrl = 'http://123.56.135.196:4003/api/sysconfig'
    const baseUrl = 'http://123.56.135.196:4003/api/sysconfig'
    
    function SysConfigService($http) {

        function getDepartmentGroups(successFn, errorFn) {
            $http({
                url: baseUrl + '/dptgroup',
                method: 'GET'
            }).success(successFn).error(errorFn);

        }

        function insertDepartmentGroup(data, successFn, errorFn) {

            /*
            var body = {
                id: data.id,
                name: data.name
            };

            $http({
                url: baseUrl + '/dptgroup',
                method: 'POST',
                body: JSON.stringify(body)
            }).success(successFn).error(errorFn);
            */

            var body = {
                id: data.id,
                name: data.name
            };

            $http.post(baseUrl + '/dptgroup', body).success(successFn).error(errorFn);

        }

        function updateDepartmentGroup(data, successFn, errorFn) {
            var body = {
                _id: data._id,
                name: data.name
            };
            $http.put(baseUrl + '/dptgroup/update', body).success(successFn).error(errorFn);
        }

        function deleteDepartmentGroup(data, successFn, errorFn) {
            $http.put(baseUrl + '/dptgroup/delete?id=' + data).success(successFn).error(errorFn);
        }

        function getDepartments(successFn, errorFn) {
            $http({
                url: baseUrl + '/department',
                method: 'GET'
            }).success(successFn).error(errorFn);
        }

        function insertDepartment(data, successFn, errorFn) {
            var body = {
                id: data.id,
                name: data.name,
                group: data.group
            };
            $http.post(baseUrl + '/department', body).success(successFn).error(errorFn);
        }

        return {
            getDepartmentGroups: getDepartmentGroups,
            insertDepartmentGroup: insertDepartmentGroup,
            updateDepartmentGroup: updateDepartmentGroup,
            deleteDepartmentGroup: deleteDepartmentGroup,
            getDepartments: getDepartments,
            insertDepartment: insertDepartment
        } 
    }
    
})();