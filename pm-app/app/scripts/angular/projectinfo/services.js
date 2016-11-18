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
            setProjectMemberAuthority: _setProjectMemberAuthority
        };

        return service;

        /**
         * 设置项目组成员的权限
         * @param {Object} opt opt.projectID, opt.member, opt.isReviewer
         * @param successFn
         * @param errorFn
         * @private
         */
        function _setProjectMemberAuthority(opt, successFn, errorFn) {
            $http.post(BASEPATH + '/project', projectModule).success(successFn).error(errorFn);
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
            var projectID = option.projectID;
            var startMonth = option.startMonth;
            var endMonth = option.endMonth;
            var condition = '';
            if (projectID) {
                condition +='id=' + projectID;
            }
            if (startMonth && endMonth) {
                condition += '&smonth=' + startMonth.toString();
                condition += '&emonth=' + endMonth.toString();
            }
            $http.get(BASEPATH + '/project/static?' + condition).success(successFn).error(errorFn);
        }

    }

})();