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

    /**
     * 排序 并且过滤掉工作量为0的项目
     */
    app.filter("sort_NotZero", sort_NotZero);

    function substring_str() {
        return function (str, subNum) {
            if (str.length > subNum) {
                return str.substring(0, subNum) + "...";
            } else {
                return str;
            }
        }
    }

    function sort_NotZero() {
        return function (list) {
            var tmpArray = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].myWorkDone > 0) {
                    tmpArray.push(list[i]);
                }
            }

            tmpArray.sort(sortNumber);

            return tmpArray;
        }

        function sortNumber(a, b) {
            return -(a.myWorkDone - b.myWorkDone);
        }
    }

})();