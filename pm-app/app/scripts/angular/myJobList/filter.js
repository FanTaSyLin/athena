/**
 * Created by FanTaSyLin on 2016/10/14.
 */

(function () {

    'use strict';

    angular.module('MyJobs')
        .filter('to_trusted', toTrusted);

    toTrusted.$inject = ['$sce'];

    function toTrusted($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }

})();