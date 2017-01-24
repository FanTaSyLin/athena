/**
 * Created by FanTaSyLin on 2016/10/14.
 */

(function () {

    'use strict';

    var app = angular.module('MyJobs')
    app.filter('to_trusted', toTrusted);
    /**
     * 截断字符串
     */
    app.filter("substring_str", substring_str);

    /**
     * 清除html标签
     */
    app.filter("delHtmlTag", delHtmlTag)

    toTrusted.$inject = ['$sce'];

    function toTrusted($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }

    function substring_str() {
        return function (str, subNum) {

            if (str === null || str === undefined) return "";

            if (str.length > subNum) {
                return str.substring(0, subNum) + "...";
            } else {
                return str;
            }
        }
    }

    function delHtmlTag() {
        return function (str) {
            var tmpStr = str.replace(/<[^>]+>/g, "");//去掉所有的html标记
            tmpStr = tmpStr.replace(/&NBSP;/g, "");
            tmpStr = tmpStr.replace(/&nbsp;/g, "");
            if (tmpStr.length > 130) {
                tmpStr = tmpStr.substring(0, 130) + '...';
            }
            return tmpStr;
        }
    }

})();