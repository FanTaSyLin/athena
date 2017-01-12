/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    "use strict";

    angular.module("MemberStatus")
        .factory("MemberStatusServices", MemberStatusServicesFn);

    MemberStatusServicesFn.$inject = ["$http"]

    function MemberStatusServicesFn($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';

        var self = {};

        return self;

    }

})();