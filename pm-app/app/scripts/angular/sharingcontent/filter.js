/**
 * Created by FanTaSyLin on 2017/3/1.
 */

(function () {

    'use strict';

    var app = angular.module('SharingContent');

    app.filter('to_trusted', toTrusted);    

    toTrusted.$inject = ['$sce'];

    function toTrusted($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }
    
})();