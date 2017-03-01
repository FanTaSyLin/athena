/**
 * Created by FanTaSyLin on 2017/3/1.
 */

(function () {

    "use strict";

    angular.module('SharingContent')
        .controller('SharingContentController', SharingContentControllerFn);

    SharingContentControllerFn.$inject = ['SharingContentServices'];

    function SharingContentControllerFn(SharingContentServices) {

        var self = this;

        self.initData = _initData;
        self.content = "";
        self.title = "";

        function _initData() {
            var _id = _getQueryString("id");
            SharingContentServices.getSharingContent(_id, function (res) {
                self.content = res.content;
                self.title = res.title;
            }, function (res) {

            });  
        }

        /**
         * @description 获取地址栏参数
         * @param {string} paramName
         * @return {string|null} paramValue
         * @private
         */
        function _getQueryString(paramName) {
            var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)return unescape(r[2]);
            return null;
        }

    }

})();