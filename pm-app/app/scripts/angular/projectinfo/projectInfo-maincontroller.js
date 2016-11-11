/**
 * Created by FanTaSyLin on 2016/11/4.
 */


(function () {

    'use strict';

    angular.module('ProjectInfo')
        .controller('ProjectInfo-MainController', MainControllerFn);

    MainControllerFn.$inject = ['$location', '$cookies', 'ProjectInfoServices'];

    function MainControllerFn($location, $cookies, ProjectInfoServices) {
        var self = this;
        var myStar = [];
        var projectID = '';

        self.isStarred = false;
        self.thisProject = {};

        self.init = _init;
        self.starred = _starred;

        function _init() {

            //TODO: 从url中截取 projectid 继而获取整个项目的属性
            projectID = $location.search().projectid;

            //从cookies中读取mystar
            myStar = $cookies.getObject('mystar-project');

            //判断该项目是否为加星项目
            self.isStarred = _checkIsStarred(projectID);

            //获取整个项目的基本属性 （projectSchema）
            ProjectInfoServices.getProjectBaseInfo(projectID, function (res) {
                if (res.data !== null && res.data !== undefined && res.data.length > 0) {
                    var doc = res.data[0];
                    for (var p in doc) {
                        self.thisProject[p] = doc[p];
                    }
                }
            }, function (err) {

            });

            //TODO: 获取项目的统计信息
            ProjectInfoServices.getProjectStaticInfo(projectID, function (res) {

            });
        }

        function _checkIsStarred(projectID) {
            var stars = $cookies.getObject('mystar-project');
            var result = false;
            for (var i = 0; i < stars.length; i++) {
                if (stars[i] === projectID) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        function _starred() {
            self.isStarred = !self.isStarred;
            if (self.isStarred === true) {
                //cookies 对应修改状态
                myStar.push(projectID);
            } else {
                //cookies 对应修改状态
                var index = -1;
                for (var i = 0; i < myStar.length; i++) {
                    if (myStar[i] === projectID) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    myStar.splice(index, 1);
                }
            }
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7000);
            $cookies.putObject('mystar-project', myStar, {'expires': expireTime});
        }
    }

})();
