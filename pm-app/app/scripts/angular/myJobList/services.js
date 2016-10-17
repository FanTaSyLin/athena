/**
 * Created by FanTaSyLin on 2016/10/12.
 */

(function () {

    'use strict';

    angular.module('MyJobs')
        .factory('MyJobsServices', MyJobsServicesFn);

    MyJobsServicesFn.$inject = ['$http']

    function MyJobsServicesFn($http) {

        var BASEPATH = 'http://localhost:4003/api';

        var self= {};

        self.getPastProjects = _getPastProjects; /*获取参与的项目列表*/
        self.getJobListPagination = _getJobListPagination; /*获取工作记录列表的分页信息*/
        self.getJobListByPage = _getJobListByPage; /*按分页获取工作记录*/
        self.getJobList = _getJobList; /*获取工作记录*/
        self.recodeUpdate = _recodeUpdate; /*更改工作记录*/

        function _getPastProjects(account, successFn, errorFn) {
            $http.get(BASEPATH + '/project/projectlist/' + account)
                .success(successFn)
                .error(errorFn);
        }

        function _getJobListPagination(condition, successFn, errorFn) {
            var condition_Project = '';
            var condition_account = '';
            if (condition.projectList) {
                condition_Project = 'projectid=';
                var _id = '';
                for (var i = 0; i < condition.projectList.length; i++) {
                    _id = condition.projectList[i]._id;
                    if (i === condition.projectList.length -1) {
                        condition_Project += _id;
                    } else {
                        condition_Project += (_id + '%20');
                    }
                }
            }
            if (condition.account) {
                condition_account = 'memberid=' + condition.account;
            }
            var conditionStr = condition_Project + '&' + condition_account;

            $http.get(BASEPATH + '/jobrecode/joblist/count?' + conditionStr).success(successFn).error(errorFn);
        }

        function _getJobListByPage(condition, successFn, errorFn) {
            var condition_Project = '';
            var condition_account = '';
            if (condition.projectList) {
                condition_Project = 'projectid=';
                var _id = '';
                for (var i = 0; i < condition.projectList.length; i++) {
                    _id = condition.projectList[i]._id;
                    if (i === condition.projectList.length -1) {
                        condition_Project += _id;
                    } else {
                        condition_Project += (_id + '%20');
                    }
                }
            }
            if (condition.account) {
                condition_account = 'memberid=' + condition.account;
            }
            var conditionStr = condition_Project + '&' + condition_account + '&'
                + 'startnum=' + condition.startNum + '&' + 'pagesize=' + condition.pageSize;

            $http.get(BASEPATH + '/jobrecode/joblist/pagination?' + conditionStr).success(successFn).error(errorFn);
        }

        function _getJobList(condition, successFn, errorFn) {
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

        function _recodeUpdate(data, successFn, errorFn) {
            $http.post(BASEPATH + '/jobrecode/update', data).success(successFn).error(errorFn);
        }

        return self;
    }

})();