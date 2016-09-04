/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular.module('PMSoft').config(PMSoftConfig);

    PMSoftConfig.$inject = ['$httpProvider'];

    function PMSoftConfig($httpProvider) {

        //$locationProvider.html5Mode(true);
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

})();