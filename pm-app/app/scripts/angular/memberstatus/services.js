/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    "use strict";

    angular.module("MemberStatus")
        .factory("MemberStatusServices", MemberStatusServicesFn);

    MemberStatusServicesFn.$inject = ["$http"]

    function MemberStatusServicesFn($http) {

        var BASEPATH = "http://123.56.135.196:4003/api";

        var self = {
            /**
             * @description 获取成员信息 （部门、电话等）
             */
            getMemberInfo: _getMemberInfo,

            /**
             * @description 获取参与的项目
             */
            getPastProjects: _getPastProjects,

            /**
             * @description 获取账户在项目中的统计信息
             */
            getProjectStaticByAccount: _getProjectStaticByAccount,

            /**
             * @description 获取工作记录
             */
            getJobLogs: _getJobLogs

        };

        return self;

        function _getMemberInfo(account, successFn, errorFn) {
            var url = BASEPATH + "/employee?account=" + account;
            $http.get(url).success(successFn).error(errorFn);
        }

        function _getPastProjects(account, successFn, errorFn) {
            $http.get(BASEPATH + '/project/projectlist/' + account).success(successFn).error(errorFn);
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

    }

})();