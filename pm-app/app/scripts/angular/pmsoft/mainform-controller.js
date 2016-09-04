/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('PMController', PMController);

    PMController.$inject = ['$cookies', 'PMSoftServices'];

    function PMController($cookies, PMSoftServices) {
        var self = this;

        init();

        function init() {
            self.account = $cookies.get('username');
            PMSoftServices.getEmployeeByAccount(self.account, function (data) {
                data.forEach(function (item) {
                    $cookies.put('name', item.name);
                    $cookies.put('avatar', item.avatar);
                });
            }, function (data, status, headers, config) {

            });
        }

    }


})();