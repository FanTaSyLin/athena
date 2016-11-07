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
            getProjectBaseInfo: _getProjectBaseInfo
        };

        return service;

        /**
         * 获取项目的基础信息
         * @param {String} projectID 项目ID (_id)
         */
        function _getProjectBaseInfo(projectID, successFn, errorFn) {
            $http.get(BASEPATH + '/project?id=' + projectID).success(successFn).error(errorFn);
        }

    }

})();