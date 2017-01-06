/**
 * Created by FanTaSyLin on 2017/1/6.
 */

(function () {

    "use strict";

    angular.module("PMSoft")
        .controller("DepartmentController", DepartmentControllerFn);

    DepartmentControllerFn.$inject = ['PMSoftServices', '$cookies'];

    function DepartmentControllerFn(PMSoftServices, $cookies) {

        var self = this;

        self.initData = _initData;

        function _initData() {
            if (window.location.hash === '#/department') {
                /**
                 * @todo 获取部门成员列表， 根据列表内容获取工作记录， 根据工作记录（简化信息）生成曲线图
                 */

            }
        }
    }

})();