/**
 * Created by FanTaSyLin on 2017/1/24.
 */

(function () {

    "use strict";

    angular.module("PMSoft")
        .controller("AccountConfigController", AccountConfigControllerFn);

    AccountConfigControllerFn.$inject = ["$cookies", "PMSoftServices"];

    function AccountConfigControllerFn($cookies, PMSoftServices) {

        var self = this;

        self.account = "";
        self.orgPassword = "";
        self.newPassword = "";
        self.newPassword2 = "";

        self.init = _init;
        self.changePasswordByKey = _changePasswordByKey;
        self.changePassword = _changePassword;

        function _init() {
            if (window.location.hash !== '#/accountconfig') {
                return;
            } else {
                self.account = $cookies.get("account");
            }
        }

        function _changePassword() {
            if (self.newPassword !== self.newPassword2) {
                alert("输入密码不一致。");
            }

            PMSoftServices.changePwd(self.account, self.orgPassword, self.newPassword, function (res) {
                $cookies.remove('token');
                $cookies.remove('account');
                window.location.reload();
            }, function (res) {
                alert("账户名与原密码不一致。");
            });
        }
        
        function _changePasswordByKey($event) {
            if ($event.keyCode === 13) {
                _changePassword();
            }
        }

    }

})();