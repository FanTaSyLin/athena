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
        var sharingEdit = angular.element(document.getElementById('sharingEdit'));

        self.gotoMyJobsPage = _gotoMyJobsPage;
        self.signOut = _signOut;
        self.showSharingEditModal = _showSharingEditModal;
        
        _init();

        function _showSharingEditModal() {
            
            var sysconfig = $cookies.getObject("Sysconfig");
            var departmentID = $cookies.get("department");
            var myDepartment = {};

            for (var i = 0; i < sysconfig[0].departments.length; i++) {
                if (sysconfig[0].departments[i].id.toString() === departmentID) {
                    myDepartment = sysconfig[0].departments[i].name;
                }
            }

            PMSoftServices.sharingTarget.param = departmentID;
            PMSoftServices.sharingTarget.name = myDepartment;
            PMSoftServices.sharingTarget.type = "department";
            PMSoftServices.sharingTargets.splice(0, PMSoftServices.sharingTargets.length);
            PMSoftServices.sharingTargets.push({
                param: departmentID,
                name: myDepartment,
                type: "department"
            });
            _getProjects(function (err, data) {
                data.forEach(function (item) {
                    PMSoftServices.sharingTargets.push({
                        param: item._id,
                        name: item.cnName,
                        type: "project"
                    });
                });
            });
            sharingEdit.modal({backdrop: 'static', keyboard: false});
        }

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

        function _getProjects(cb) {

            pastProjects = [];

            /*获取项目列表*/
            PMSoftServices.getPastProjects($cookies.get('account'), function (data) {

                data.forEach(function (item) {
                    var project = {};
                    project.cnName = item.cnName;
                    project._id = item._id;
                    project.enName = item.enName;
                    pastProjects.push(project);
                });

                cb(null, pastProjects)

            }, function (data, status, headers, config) {
                cb(new Error(), null);
            });


        }
    }


})();