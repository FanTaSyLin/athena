/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    "use strict";

    angular.module("MemberStatus")
        .factory("MemberStatusServices", MemberStatusServicesFn);

    MemberStatusServicesFn.$inject = ["$http"]

    function MemberStatusServicesFn($http) {

        var BASEPATH = "http://123.56.135.196:4003/api";

        var self = {
            /**
             * @description 获取成员信息 （部门、电话等）
             */
            getMemberInfo: _getMemberInfo,
        };

        return self;

        function _getMemberInfo(account, successFn, errorFn) {
            var url = BASEPATH + "/employee?account=" + account;
            $http.get(url).success(successFn).error(errorFn);
        }

    }

})();