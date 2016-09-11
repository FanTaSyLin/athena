/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('PMController', PMController);

    PMController.$inject = ['$cookies', '$rootScope', 'PMSoftServices'];

    function PMController($cookies, $rootScope, PMSoftServices) {
        var self = this;

        init();

        function init() {
            self.account = $cookies.get('username');
            PMSoftServices.getEmployeeByAccount(self.account, function (data) {
                data.forEach(function (item) {
                    $cookies.put('name', item.name);
                    $cookies.put('avatar', item.avatar);
                    $rootScope.account = self.account;
                    $rootScope.username = item.name;
                    $rootScope.avatar = item.avatar;
                    $rootScope.department = item.department;
                });
            }, function (data, status, headers, config) {

            });
        }

    }


})();