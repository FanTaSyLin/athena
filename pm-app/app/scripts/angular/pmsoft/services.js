/**
 * Created by FanTaSyLin on 2016/8/30.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .factory('PMSoftServices', Services);

    Services.$inject = ['$http']

    function Services($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';

        var self = {
            getEmployeeByName: _getEmployeeByName,
            getEmployeeByAccount: _getEmployeeByAccount,
            createProject: _createProject,
            getPastProjects: _getPastProjects,
            getDateList: _getDateList,
            recodeSubmit: _recodeSubmit,
            getJobList: _getJobList,
            getUnauditedJobs: _getUnauditedJobs,
            changeCurrentUnauditedJob: _changeCurrentUnauditedJob,
            cleanUnauditedJobList_Total: _cleanUnauditedJobList_Total, /*清空unauditedJobList_Total*/
            recodeCheck: _recodeCheck, /*审核工作记录*/
            recodeTurnBack: _recodeTurnBack, /*退回工作记录*/
            getProjectStaticByAccount: _getProjectStaticByAccount,
            getDepartmentMembers: _getDepartmentMembers,
            getSysConfig: _getSysConfig,

            pastProjects: [], /*参与过的项目列表*/
            jobRecodeDateList: [], /*填写工作记录时所使用的日期列表*/
            recodedJobLogList: [], /*已提交工作记录列表*/
            currentUnauditedJob: {}, /*当前待审核工作记录 为UnauditedsCtrl与 ReviewCtrl 传递参数*/
            unauditedJobList_Total: [], /*未审核工作列表-总体 为ReviewCtrl 传递参数*/
            unauditedJobList_Filter: [], /*未审核工作列表-筛选后保留 为ReviewCtrl 传递参数*/
            unauditedJobList_View: [], /*未审核工作列表-分页后显示用 为ReviewCtrl 传递参数*/
            currentUnauditedJobIndex: 0 /*一个计数器，用来标识currentUnauditedJob 在数组中的位置 每次数组更新 该下标重置为0*/
        }

        return self;

        function _getEmployeeByAccount(memberAccount, successFn, errorFn) {
            $http({
                url: BASEPATH + '/employee?account=' + memberAccount,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function _getEmployeeByName(memberName, successFn, errorFn) {
            var encodeStr = encodeURIComponent(memberName);
            $http({
                url: BASEPATH + '/employee?name=' + encodeStr,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function _createProject(projectModule, successFn, errorFn) {
            $http.post(BASEPATH + '/project', projectModule).success(successFn).error(errorFn);
        }

        function _getPastProjects(account, successFn, errorFn) {
            if (account === 'all') {
                $http.get(BASEPATH + '/project/projectlist').success(successFn).error(errorFn);
            } else {
                $http.get(BASEPATH + '/project/projectlist/' + account).success(successFn).error(errorFn);
            }
        }

        function _getDateList(successFn, errorFn) {
            $http.get(BASEPATH + '/jobrecode/datelist').success(successFn).error(errorFn);
        }

        function _recodeSubmit(data, successFn, errorFn) {
            $http.post(BASEPATH + '/jobrecode/submit', data).success(successFn).error(errorFn);
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

        function _getUnauditedJobs(condition, successFn, errorFn) {
            var condition_Project = '';
            var condition_Member = '';
            if (condition.projectList) {
                condition_Project = 'projectid=';
                var _id = '';
                for (var i = 0; i < condition.projectList.length; i++) {
                    _id = condition.projectList[i]._id;
                    if (i === condition.projectList.length - 1) {
                        condition_Project += _id;
                    } else {
                        condition_Project += (_id + '%20');
                    }
                }
            }
            if (condition.memberID) {
                condition_Member = 'memberid=' + condition.memberID;
            }
            var conditionStr = condition_Project + '&' + condition_Member;

            $http.get(BASEPATH + '/jobrecode/unauditedlist?' + conditionStr).success(successFn).error(errorFn);
        }

        function _changeCurrentUnauditedJob(module) {
            for (var p in module) {
                self.currentUnauditedJob[p] = module[p];
            }
            if (self.unauditedJobList_Filter.length) {
                for (var i = 0; i < self.unauditedJobList_Filter.length; i++) {
                    if (self.unauditedJobList_Filter._id == module._id) {

                        self.currentUnauditedJobIndex = i;
                    }
                }
            }
        }

        /**
         *清空 unauditedJobList_Total 原有数据
         */
        function _cleanUnauditedJobList_Total() {
            self.unauditedJobList_Total.splice(0, self.unauditedJobList_Total.length);
            self.currentUnauditedJobIndex = 0;
        }

        function _recodeCheck(body, successFn, errorFn) {
            //为了减少传输数据的大小 body中除了有用的信息外其他信息需清除
            var item = {};
            for (var pro in body) {
                item[pro] = body[pro];
            }
            item.content = '';
            $http.post(BASEPATH + '/jobrecode/check', item).success(successFn).error(errorFn);
        }

        function _recodeTurnBack(body, successFn, errorFn) {
            //为了减少传输数据的大小 body中除了有用的信息外其他信息需清除
            var item = {};
            for (var pro in body) {
                item[pro] = body[pro];
            }
            item.content = '';
            $http.post(BASEPATH + '/jobrecode/turnback', item).success(successFn).error(errorFn);
        }

        /**
         * @description 获取该账户参加的所有项目的工作量统计结果 （包括：该项目的总工时，该账户在此项目中的总工时）
         * @param {string} account
         * @param {string[]} projectIDs
         * @param {Function} successFn
         * @param {Function} errorFn
         * @private
         */
        function _getProjectStaticByAccount(account, projectIDs, successFn, errorFn) {
            var projectIDsStr = " ";
            projectIDs.forEach(function (item) {
                projectIDsStr += item + " ";
            });
            var urlStr = BASEPATH + "/static/psoneral/realworkdone/" + account + "/" + projectIDsStr;
            $http.get(urlStr).success(successFn).error(errorFn);
        }

        /**
         * @description 根据部门编号获取部门成员信息
         * @param departmentNum 部门编号
         * @callback successFn
         * @callback errorFn
         * @private
         */
        function _getDepartmentMembers(departmentNum, successFn, errorFn) {
            var urlStr = BASEPATH + "/department/members?departmentnum=" + departmentNum;
            $http.get(urlStr).success(successFn).error(errorFn);
        }

        function _getSysConfig(successFn, errorFn) {
            var urlStr = BASEPATH + "/sysconfig";
            $http.get(urlStr).success(successFn).error(errorFn);
        }
    }

})();