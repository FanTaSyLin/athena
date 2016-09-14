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

            /**
             * 页面加载后需要获取如下信息：
             * 1 获取个人信息 （姓名、头像）
             * 2 获取项目信息 （项目cnName enName _id)
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

            PMSoftServices.getPastProjects(self.account, function (data) {

                data.forEach(function (item) {
                    var project = {};
                    project.cnName = item.cnName;
                    project._id = item._id;
                    project.enName = item.enName;
                    PMSoftServices.pastProjects.push(project);
                });

            }, function (res) {

            });

        }

    }


})();