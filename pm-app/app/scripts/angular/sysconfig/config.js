/**
 * Created by FanTaSyLin on 2016/8/24.
 */

(function () {

    'use strict';

    angular.module('SysConfig')
        .config(configFn);

    configFn.$inject = ['$httpProvider']

    function configFn($httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';

        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

    }

})();