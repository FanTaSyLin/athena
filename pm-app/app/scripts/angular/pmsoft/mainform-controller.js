/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('MainController', MainController);

    MainController.$inject = ['$cookies', '$rootScope', 'PMSoftServices'];

    function MainController($cookies, $rootScope, PMSoftServices) {
        var self = this;

        self.gotoMyJobsPage = _gotoMyJobsPage;
        
        _init();

        /**
         * 初始化数据
         * @private
         */
        function _init() {
            self.account = $cookies.get('username');

            /**
             * 页面加载后需要获取如下信息：
             * 1 获取个人信息 （姓名、头像）
             * 2 获取项目信息 （项目cnName enName _id)
             *
             */
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
        
        function _gotoMyJobsPage() {
            window.open("pm-soft/myjobs");
        }
    }


})();