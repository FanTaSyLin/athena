/**
 * Created by FanTaSyLin on 2016/9/29.
 */

(function () {

    'use strict';

    var app = angular.module('PMSoft');
    app.filter('to_trusted', toTrusted);
    /**
     * 移除掉未审核记录数量为0的项目（审核页面左侧列表）
     */
    app.filter('rm_project_unaudited_count0', rmProjectByCount0);

    /**
     * 当未审核记录数量大于100时 显示100+
     */
    app.filter('add_plus_count_lsg100', add_plus_count_lsg100);

    /**
     * 审核页面  过滤掉已审核以及已拒绝的工作记录
     */
    app.filter('filter_pass_turnback_logs', filter_pass_turnback_logs);

    /**
     * 截断字符串
     */
    app.filter('substring_str', substring_str);

    /**
     * 日期格式化
     */
    app.filter("dateFormat", dateFormat);

    /**
     * 清除html标签
     */
    app.filter("delHtmlTag", delHtmlTag);

    toTrusted.$inject = ['$sce'];

    function toTrusted($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }

    function rmProjectByCount0() {
        return function (items) {
            var array = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].count !== 0) {
                    array.push(items[i]);
                }
            }
            return array;
        }
    }

    function add_plus_count_lsg100() {
        return function (item) {

            if (item === null || item === undefined) {
                return "";
            }

            if (item > 100) {
                return "100" + "+";
            } else {
                return item.toString();
            }
        }
    }

    function filter_pass_turnback_logs() {
        return function (items) {
            var array = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].status === "Submit") {
                    array.push(items[i]);
                }
            }
            return array;
        }
    }

    function substring_str() {

        return function (str, subNum) {
            if (str === undefined) {
                return;
            }
            if (str.length > subNum) {
                return str.substring(0, subNum) + "...";
            } else {
                return str;
            }
        }
    }

    function dateFormat() {
        return function (dateTime, formatStr) {
            if (dateTime !== null && dateTime !== undefined) {
                return moment(dateTime).format(formatStr);
            } else {
                return "";
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