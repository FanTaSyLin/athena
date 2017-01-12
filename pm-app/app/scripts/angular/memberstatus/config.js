/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    'use strict';

    angular.module('MemberStatus')
        .config(MemberStatusFn);

    MemberStatusFn.$inject = ['$httpProvider'];

    function MemberStatusFn($httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        //$httpProvider.defaults.withCredentials = true;
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
    }

})();