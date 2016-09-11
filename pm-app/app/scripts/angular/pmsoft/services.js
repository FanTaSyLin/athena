/**
 * Created by FanTaSyLin on 2016/8/30.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .factory('PMSoftServices', Services);

    Services.$inject = ['$http']

    function Services($http) {

        var BASEPATH = 'http://localhost:4003/api';

        return {
            getEmployeeByName: getEmployeeByName,
            getEmployeeByAccount: getEmployeeByAccount,
            createProject: createProject,
            getPastProjects: getPastProjects,
            getDateList: getDateList,
            recodeSubmit: recodeSubmit
        }

        function getEmployeeByAccount(memberAccount, successFn, errorFn) {
            $http({
                url: BASEPATH + '/employee?account=' + memberAccount,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function getEmployeeByName(memberName, successFn, errorFn) {
            var encodeStr = encodeURIComponent(memberName);
            $http({
                url: BASEPATH + '/employee?name=' + encodeStr,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function createProject(projectModule, successFn, errorFn) {
            $http.post(BASEPATH + '/project', projectModule).success(successFn).error(errorFn);
        }

        function getPastProjects(account, successFn, errorFn) {
            $http.get(BASEPATH + '/project/projectlist/' + account).success(successFn).error(errorFn);
        }

        function getDateList(successFn, errorFn) {
            $http.get(BASEPATH + '/jobrecode/datelist').success(successFn).error(errorFn);
        }

        function recodeSubmit(data, successFn, errorFn) {
            $http.post(BASEPATH + '/jobrecode', data).success(successFn).error(errorFn);
        }
    }

})();