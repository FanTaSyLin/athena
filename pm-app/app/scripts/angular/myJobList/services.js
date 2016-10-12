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

        function _getPastProjects(account, successFn, errorFn) {
            $http.get(BASEPATH + '/project/projectlist/' + account)
                .success(successFn)
                .error(errorFn);
        }

        return self;
    }

})();