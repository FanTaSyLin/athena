/**
 * Created by FanTaSyLin on 2016/8/20.
 */

(function () {

    angular.module('SignIn')
        .controller('SignInController', SignInCtrl);

    function SignInCtrl() {
        var self = this;
        self.account = 'fanl'
    }

})();