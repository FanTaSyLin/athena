/**
 * Created by FanTaSyLin on 2017/1/19.
 */


(function () {

    "use strict";

    var app = angular.module("MemberStatus");

    /**
     * 截断字符串
     */
    app.filter("substring_str", substring_str);

    function substring_str() {
        return function (str, subNum) {
            if (str.length > subNum) {
                return str.substring(0, subNum) + "...";
            } else {
                return str;
            }
        }
    }

})();