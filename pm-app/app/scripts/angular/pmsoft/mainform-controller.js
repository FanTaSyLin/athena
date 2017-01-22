/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('MainController', MainController);

    MainController.$inject = ['$cookies', 'PMSoftServices'];

    function MainController($cookies, PMSoftServices) {
        var self = this;

        self.gotoMyJobsPage = _gotoMyJobsPage;
        self.signOut = _signOut;
        
        _init();

        /**
         * 初始化数据
         * @private
         */
        function _init() {
            self.account = $cookies.get('account');

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
                    $cookies.put('department', item.department);
                });
            }, function (data, status, headers, config) {

            });

            /**
             * 读取配置信息 放入cookie中
             */
            PMSoftServices.getSysConfig(function (res) {
                if (res.status === "error") {

                }
                var doc = res.doc;
                $cookies.putObject('Sysconfig', doc);

            }, function (res) {

            });
        }
        
        function _gotoMyJobsPage() {
            window.open("pm-soft/myjobs");
        }

        function _signOut() {
            $cookies.remove('token');
            $cookies.remove('account');
            window.location.reload();
        }
    }


})();