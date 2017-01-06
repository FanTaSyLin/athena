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

            }
        }
    }

})();