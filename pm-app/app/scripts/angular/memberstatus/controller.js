/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    "use strict";

    angular.module("MemberStatus")
        .controller("MemberStatusController", MemberStatusControllerFn);

    MemberStatusControllerFn.$inject = ["$cookies", "MemberStatusServices"];

    function MemberStatusControllerFn($cookies, MemberStatusServices) {

        var self = this;

        self.account = $cookies.get("account");
        self.name = $cookies.get("name");
        self.member = {};
        self.profileNavCurrentItem = "";

        self.initData = _initData;
        self.profileNavIsSeleced = _profileNavIsSeleced;
        self.selectProfileNavItem = _selectProfileNavItem;

        function _initData() {

            /**
             * 获取成员的详细信息
             */
            MemberStatusServices.getMemberInfo(self.account, function (res) {

                var doc = res;
                var member = (doc.length > 0) ? doc[0] : null;
                for(var p in member) {
                    self.member[p] = member[p];
                }

            }, function (res) {

            });

            /**
             * 获取所有参与项目的相关信息
             */
            MemberStatusServices.getPastProjects(self.account, function (res) {
                
            }, function (res) {
                
            })

        }

        function _profileNavIsSeleced(item) {
            return (self.profileNavCurrentItem === item);
        }

        function _selectProfileNavItem(item) {
            self.profileNavCurrentItem = item;
        }
    }

})();