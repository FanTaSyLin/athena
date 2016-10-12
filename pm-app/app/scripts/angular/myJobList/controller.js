/**
 * Created by FanTaSyLin on 2016/10/12.
 */

(function () {

    'use strict';

    angular.module('MyJobs')
        .controller('MyJobsController', MyJobsControllerFn);

    MyJobsControllerFn.$inject = ['$cookies', 'MyJobsServices'];

    function MyJobsControllerFn($cookies, MyJobsServices) {

        var self = this;
        var myNav = angular.element(document.getElementById('myNav'));

        self.selectedProjectEName = 'all';
        self.projects = [];/*参与的项目列表*/

        self.init = _init; /*页面加载时初始化数据*/
        self.isSelectedProject = _isSelectedProject; /*是否选中项目 判断*/
        self.projectSelect = _projectSelect; /*选中项目 判断*/


        function _init() {

            //定位侧边栏
            myNav.affix({
                offset: {
                    top: 125
                }
            });

            var account = $cookies.get('username');
            //获取项目列表
            MyJobsServices.getPastProjects(account, function (data) {
                self.projects.splice(0,self.projects.length);
                data.forEach(function (item) {
                    self.projects.push(item);
                });
            }, function (data) {

            });
        }

        function _isSelectedProject(projectEName) {
            return self.selectedProjectEName == projectEName;
        }

        function _projectSelect(projectEName) {
            self.selectedProjectEName = projectEName;
            return;
        }

    }

})();