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
            recodeSubmit: recodeSubmit,
            getJobList: getJobList,
            getUnauditedJobs: getUnauditedJobs,
            pastProjects: [], /*参与过的项目列表*/
            jobRecodeDateList: [], /*填写工作记录时所使用的日期列表*/
            recodedJobLogList: [] /*已提交工作记录列表*/
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

        function getJobList(condition, successFn, errorFn) {
            var conditionStr = '';
            if (condition.username) {
                conditionStr += ('username=' + condition.username + '&');
            }
            if (condition.projectID) {
                conditionStr += ('projectid=' + condition.projectID + '&');
            }
            if (condition.startDate) {
                conditionStr += ('startdate=' + condition.startDate + '&');
            }
            if (condition.endDate) {
                conditionStr += ('enddate=' + condition.endDate + '&');
            }
            $http.get(BASEPATH + '/jobrecode/joblist?' + conditionStr).success(successFn).error(errorFn);
        }

        function getUnauditedJobs(project, successFn, errorFn) {

            var _id = project._id;

            var conditionStr = 'projectid=' + _id;

            $http.get(BASEPATH + '/jobrecode/unauditedlist?' + conditionStr).success(successFn).error(errorFn);
        }
    }

})();