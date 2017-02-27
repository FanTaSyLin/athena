/**
 * Created by FanTaSyLin on 2016/10/12.
 */

(function () {

    'use strict';

    angular.module('MyJobs')
        .factory('MyJobsServices', MyJobsServicesFn);

    MyJobsServicesFn.$inject = ['$http']

    function MyJobsServicesFn($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';

        var self= {};

        /**
         * 获取参与的项目列表
         * @type {_getPastProjects}
         */
        self.getPastProjects = _getPastProjects;
        /**
         * 获取工作记录列表的分页信息
         * @type {_getJobListPagination}
         */
        self.getJobListPagination = _getJobListPagination;
        /**
         * 按分页获取工作记录
         * @type {_getJobListByPage}
         */
        self.getJobListByPage = _getJobListByPage;
        /**
         * 获取工作记录
         * @type {_getJobList}
         */
        self.getJobList = _getJobList;
        /**
         * 更改工作记录
         * @type {_recodeUpdate}
         */
        self.recodeUpdate = _recodeUpdate;
        /**
         * 获取被退回的工作记录
         */
        self.getJobLogs_TurnBack = _getJobLogs_TurnBack;
        /**
         * @description 获取工作记录
         */
        self.getJobLogs = _getJobLogs;


        function _getJobLogs_TurnBack(account, projectIDs, skip, limit, successFn, errorFn) {
            var projectIDStr = "";
            projectIDs.forEach(function (id) {
                projectIDStr += id + " ";
            });
            var url = BASEPATH + "/jobrecode/joblist/fixnum?";
            url = url + "account=" + account;
            url = url + "&skip=" + skip + "&limit=" + limit;
            url = url + "&turnback=y";
            if (projectIDs.length > 0) {
                url = url + "&projectid=" + projectIDStr;
            }

            $http.get(url).success(successFn).error(errorFn);
        }

        /**
         * @description 获取项目相关的工作记录
         * @param {string} account
         * @param {string[]} projectIDs
         * @param {Number} skip
         * @param {Number} limit
         * @callback successFn
         * @callback errorFn
         * @private
         */
        function _getJobLogs(account, projectIDs, skip, limit, successFn, errorFn) {
            var projectIDStr = "";
            projectIDs.forEach(function (id) {
                projectIDStr += id + " ";
            });
            var url = BASEPATH + "/jobrecode/joblist/fixnum?";
            url = url + "account=" + account;
            url = url + "&skip=" + skip + "&limit=" + limit;
            if (projectIDs.length > 0) {
                url = url + "&projectid=" + projectIDStr;
            }

            $http.get(url).success(successFn).error(errorFn);
        }

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
                conditionStr += ('memberid=' + condition.username + '&');
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