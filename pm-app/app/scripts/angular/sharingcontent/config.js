/**
 * Created by FanTaSyLin on 2017/3/1.
 */

(function () {

    'use strict';

    angular.module('SharingContent')
        .config(SharingContentFn);

    SharingContentFn.$inject = ['$httpProvider'];

    function SharingContentFn($httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';

        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

})();