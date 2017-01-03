/**
 * Created by FanTaSyLin on 2017/1/3.
 */
(function () {

    angular.module("PMSoft")
        .controller("CalendarController", CalendarControllerFn);

    CalendarControllerFn.$inject = ["PMSoftServices", "$cookies"];

    function CalendarControllerFn(PMSoftServices, $cookies) {

        var self = this;
        var myCalendar = angular.element(document.getElementById("myCalendar"));

        self.initData = _initData;

        /**
         * 初始化函数
         * @private
         */
        function _initData() {
            if (window.location.hash !== "#/calendar") {
                return;
            }
            myCalendar.fullCalendar({

            });
        }

    }

})();