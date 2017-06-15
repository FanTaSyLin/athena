/**
 * Created by FanTaSyLin on 2016/11/4.
 */

(function () {

    'use strict';

    angular.module('ProjectInfo')
        .factory('ProjectInfoServices', ProjectInfoServicesFn);

    ProjectInfoServicesFn.$inject = ['$http'];

    function ProjectInfoServicesFn($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';
        
        var service = {
            getProjectBaseInfo: _getProjectBaseInfo,
            getProjectStaticInfo: _getProjectStaticInfo,
            setProjectMemberAuthority: _setProjectMemberAuthority,
            searchMembers: _searchMembers,
            addMemberToProject: _addMemberToProject,
            rmMemberToProject: _rmMemberToProject,
            getJobLogs: _getJobLogs,

            /**
             * 删除分享
             */
            deleteSharing: _deleteSharing,

            /**
             * 提交修改
             */
            editSharing: _editSharing,

            /**
             * 获取详细内容
             */
            getSharingDetail: _getSharingDetail,

            /**
             * 获取分享列表
             */
            getSharings: _getSharings,

            /**
             * 提交一个新建的分享
             */
            submitSharing: _submitSharing,

            /**
             * 当提交了一个新的分享时触发此事件
             */
            onNewSharingSubmited: undefined,

            /**
             * 当对当前分享进行了修改后触发
             */
            onSharingEdited: undefined,

            /**
             * 用来传递 分享至 后面的地址列表
             */
            sharingTargets: [],

            /**
             * 用来传递 分享至 后面的地址
             */
            sharingTarget: {
                param: "",
                name: "",
                type: ""
            },

            /**
             * 当前需要显示在modal中的分享内容详细信息
             */
            currentSharingDetail: undefined

        };

        return service;

        /**
         * @desc 删除分享
         */
        function _deleteSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/delete", data).success(successFn).error(errorFn);
        }

        /**
         * @desc 提交修改
         */
        function _editSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/edit", data).success(successFn).error(errorFn);
        }

        /**
         * @desc 获取详细分享内容
         * @param {String} _id
         */
        function _getSharingDetail(_id, successFn, errorFn) {
            $http.get(BASEPATH + "/sharing/detail?id=" + _id).success(successFn).error(errorFn);
        }

        /**
         * @desc 获取分享列表
         * @param {String} rangetype 范围类型
         * @param {String} param 参数
         */
        function _getSharings (rangeType, param, successFn, errorFn) {
            var paramStr = "";
            paramStr += "rangetype=" + rangeType;
            paramStr += "&param=" + param.toString();
            $http.get(BASEPATH + "/sharing/list?" + paramStr).success(successFn).error(errorFn);
        }

        /**
         * @description 提交一个新的分享
         * @param {Object} data 分享内容数据
         */
        function _submitSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/new", data).success(successFn).error(errorFn);
        }

        /**
         * @description 获取项目相关的工作记录
         * @param {string[]} accounts
         * @param {string} projectID
         * @param {string} startDate
         * @param {string} endDate
         * @param {Number} skip
         * @param {Number} limit
         * @callback successFn
         * @callback errorFn
         * @private
         */
        function _getJobLogs(accounts, projectID, startDate, endDate, skip, limit, successFn, errorFn) {
            var accountStr = "";
            accounts.forEach(function (account) {
                accountStr += account + " ";
            });
            var url = BASEPATH + "/jobrecode/joblist/fixnum?";
            url = url + "projectid=" + projectID;
            url = url + "&skip=" + skip + "&limit=" + limit;
            url = url + "&startdate=" + startDate + "&enddate=" + endDate;
            if (accounts.length > 0) {
                url = url + "&account=" + accountStr;
            }

            $http.get(url).success(successFn).error(errorFn);
        }

        /**
         * 移除一个项目成员
         * @param {String} projectID 项目ID
         * @param {Object} member 成员
         * @param {String} member.account 成员账号
         * @param {String} member.name 成员姓名
         * @param {Function} successFn 
         * @param {Function} errorFn
         * @private 
         */
        function _rmMemberToProject(projectID, member, successFn, errorFn) {
            $http
                .post(BASEPATH + '/project/rmmember/' + projectID, member)
                .success(successFn)
                .error(errorFn);
        }

        /**
         * 添加一个项目成员
         * @param {String} projectID 项目ID
         * @param {Object} member 成员
         * @param {String} member.account 成员账号
         * @param {String} member.name 成员姓名
         * @param {Function} successFn 
         * @param {Function} errorFn
         * @private 
         */
        function _addMemberToProject(projectID, member, successFn, errorFn) {
            $http
                .post(BASEPATH + '/project/addmember/' + projectID, member)
                .success(successFn)
                .error(errorFn);            
        }

        /**
         * 查询成员
         * @param {String} condition 查询条件
         * @param {Function} successFn 
         * @param {Function} errorFn
         * @private 
         */
        function _searchMembers(condition, successFn, errorFn) {
            var encodeStr = encodeURIComponent(condition);
            $http({
                url: BASEPATH + '/employee?account=' + condition + '&name=' + encodeStr,
                method: 'GET'
            }).success(successFn).error(errorFn);
        }

        /**
         * 设置项目组成员的权限
         * @param {String} projectID 项目ID
         * @param {String} authority 成员权限
         * @param {Object} member 成员
         * @param {String} member.account 成员账号
         * @param {String} member.name 成员姓名
         * @param {Function} successFn 
         * @param {Function} errorFn
         * @private 
         */
        function _setProjectMemberAuthority(projectID, authority, member, successFn, errorFn) {
            var o = {};
            o.account = member.account;
            o.name = member.name;
            o.authority = authority;
            $http
                .post(BASEPATH + '/project/setauthority/' + projectID, o)
                .success(successFn)
                .error(errorFn);
        }

        /**
         * 获取项目的基础信息
         * @param {String} projectID 项目ID (_id)
         */
        function _getProjectBaseInfo(projectID, successFn, errorFn) {
            $http.get(BASEPATH + '/project?id=' + projectID).success(successFn).error(errorFn);
        }

        /**
         * 获取项目的统计信息
         * @param {Object} option 包含三个属性：option.projectID, option.startMonth, option.endMonth
         * @param {Function} successFn
         * @param {Function} errorFn
         */
        function _getProjectStaticInfo(option, successFn, errorFn) {
            var url =  BASEPATH + "/static/project/" + option.project + "/activity?start=" + option.start + "&end=" + option.end;
            $http.get(url).success(successFn).error(errorFn);
        }

    }

})();