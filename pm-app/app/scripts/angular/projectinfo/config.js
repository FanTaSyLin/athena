/**
 * Created by FanTaSyLin on 2016/11/4.
 */

(function () {

    'use strict';

    angular.module('ProjectInfo')
        .config(ProjectInfoConfig);

    ProjectInfoConfig.$inject = ['$httpProvider', '$locationProvider'];

    function ProjectInfoConfig($httpProvider, $locationProvider) {

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';

        /*
         //Disable IE ajax request caching start
         if (!$httpProvider.defaults.headers.get) {
         $httpProvider.defaults.headers.get = {};
         }
         $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
         $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
         //Disable IE ajax request caching end
         */


        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $httpProvider.defaults.headers.common = {};
    }

})();