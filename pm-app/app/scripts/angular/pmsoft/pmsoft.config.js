/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular.module('PMSoft').config(PMSoftConfig);

    PMSoftConfig.$inject = ['$httpProvider'];

    function PMSoftConfig($httpProvider) {

        //$locationProvider.html5Mode(true);

        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
    }

})();