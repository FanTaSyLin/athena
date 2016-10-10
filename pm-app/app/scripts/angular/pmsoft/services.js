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

        var self = {
            getEmployeeByName: getEmployeeByName,
            getEmployeeByAccount: getEmployeeByAccount,
            createProject: createProject,
            getPastProjects: getPastProjects,
            getDateList: getDateList,
            recodeSubmit: recodeSubmit,
            getJobList: getJobList,
            getUnauditedJobs: getUnauditedJobs,
            changeCurrentUnauditedJob: changeCurrentUnauditedJob,
            cleanUnauditedJobList_Total: cleanUnauditedJobList_Total, /*清空unauditedJobList_Total*/
            recodeCheck: recodeCheck, /*审核工作记录*/
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
            $http.post(BASEPATH + '/jobrecode/submit', data).success(successFn).error(errorFn);
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

        function getUnauditedJobs(condition, successFn, errorFn) {
            var condition_Project = '';
            var condition_Member = '';
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
            if (condition.memberID) {
                condition_Member = 'memberid=' + condition.memberID;
            }
            var conditionStr = condition_Project + '&' + condition_Member;

            $http.get(BASEPATH + '/jobrecode/unauditedlist?' + conditionStr).success(successFn).error(errorFn);
        }

        function changeCurrentUnauditedJob(module) {
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
        function cleanUnauditedJobList_Total() {
            self.unauditedJobList_Total.splice(0,self.unauditedJobList_Total.length);
            self.currentUnauditedJobIndex = 0;
        }

        function recodeCheck(body, successFn, errorFn) {
            //为了减少传输数据的大小 body中除了有用的信息外其他信息需清除
            var item = {};
            for(var pro in body){
                item[pro] = body[pro];
            }
            item.content = '';
            $http.post(BASEPATH + '/jobrecode/check', item).success(successFn).error(errorFn);
        }
    }

})();