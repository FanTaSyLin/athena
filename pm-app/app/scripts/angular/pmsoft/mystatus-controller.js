/**
 * Created by FanTaSyLin on 2016/9/12.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('MyStatusController', MyStatusController);

    MyStatusController.$inject = ['PMSoftServices', '$cookies'];

    function MyStatusController(PMSoftServices, $cookies) {

        var self = this;
        var ctxByDay = angular.element(document.getElementById('myStatus-Chart-ByDay'));
        var ctxByPj = angular.element(document.getElementById('myStatus-Chart-ByPj'));

        self.account = $cookies.get('account');

        /**
         * 项目统计对象列表
         * @type {ProjectStaticObj[]}
         */
        self.projectList = [];

        self.init = _init;

        function _init() {

            if (window.location.hash === '#/mystatus') {

                var TIMESPAN = 30;
                var condition = {};
                var endDateStr = moment.utc().format('YYYY-MM-DD');
                var startDateStr = moment.utc().add(-TIMESPAN, "d").format('YYYY-MM-DD');
                condition.username = self.account;
                condition.startDate = startDateStr;
                condition.endDate = endDateStr;


                //获取近期工作记录
                PMSoftServices.getJobList(condition, function (data) {

                    //TODO: 对获取到的数据进行处理
                    //TODO: 生成图表数据
                    var myLine = _lineInit(startDateStr, TIMESPAN, data.doc);
                    var myPie = _pieInit(data.doc)
                }, function (data) {

                });

                /**
                 * 获取项目统计信息（包含：个人工作量在全项目中的占比，以及个人在项目中的总工作量）
                 */
                _getProjectStatic(self.account);
            }

        }

        /**
         * 获取项目统计信息（个人工作量在全项目中的占比，以及个人在项目中的总工作量）
         * @param account 账号
         * @return 
         * @private
         */
        function _getProjectStatic(account) {
            //获取参与项目的列表
            PMSoftServices.getPastProjects(account, function (data) {
                self.projectList.splice(0, self.projectList.length);

                /**
                 * @type {ProjectStaticObj}
                 */
                var project = undefined;

                var projectIDs = [];

                data.forEach(function (item) {
                    project = {};
                    project.cnName = item.cnName;
                    project.enName = item.enName;
                    project.about = item.about;
                    project.isClosed = item.isClosed;
                    project.type = item.type;
                    project._id = item._id;
                    project.myWorkDone = 0;
                    project.totalWorkDone = 0;
                    project.percent = 0;
                    projectIDs.push(item._id);
                    self.projectList.push(project);
                });

                //根据以获取的列表获取统计信息
                PMSoftServices.getProjectStaticByAccount(account, projectIDs, function (res) {

                    /**
                     * @type {Object[]}
                     */
                    var data = res.doc;
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < self.projectList.length; j++) {
                            if (data[i].projectID === self.projectList[j]._id) {
                                self.projectList[j].myWorkDone = data[i].myWorkDone;
                                self.projectList[j].totalWorkDone = data[i].totalWorkDone;var precent = 0 ;
                                if (self.projectList[j].totalWorkDone !== 0) {
                                    precent = ((self.projectList[j].myWorkDone / self.projectList[j].totalWorkDone) * 100).toFixed(0)
                                }
                                self.projectList[j].percent = precent;
                            }
                        }
                    }

                    //渲染页面
                    for (var  k= 0; k < self.projectList.length; k++) {
                        var percircleItem = angular.element(document.getElementById(self.projectList[k]._id + '-circle'));
                        percircleItem.percircle({
                            progressBarColor: "#167385",
                            percent: self.projectList[k].percent
                        });
                    }
                }, function (res) {

                });

            }, function (res) {

            });
        }

        /**
         *
         * @param {string} startDate
         * @param {Number} Num
         * @param {Object[]} datas
         * @returns {{}}
         * @private
         */
        function _lineInit(startDateStr, Num, datas) {
            var labelList = [];
            var dataList = [];
            for (var i = 0; i <= Num; i++) {
                var tmpStr = moment(startDateStr).add(i, "d").format("MM月DD日");
                labelList.push(tmpStr);
                var isExist = false;
                for (var j = 0; j < datas.length; j++) {
                    var data = datas[j];
                    if (moment(data.date).format("MM月DD日") === tmpStr) {
                        dataList.push(data.duration);
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    dataList.push(0);
                }
            }


            var config = {
                type: 'line',
                data: {
                    labels: labelList,
                    datasets: [{
                        label: "工作量",
                        data: dataList,
                        borderColor: 'rgba(154, 89, 181, 0.7)',
                        backgroundColor: 'rgba(154, 89, 181, 0.5)',
                        pointBorderColor: 'rgba(255, 255, 255 , 1)',
                        pointBackgroundColor: 'rgba(141, 68, 173 , 0.7)',
                        pointBorderWidth: 2,
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            display: true
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: '工作量（小时）'
                            }
                        }]
                    }
                }
            }
            return new Chart(ctxByDay, config);
        }

        /**
         * @param {Object[]} datas
         * @returns {{}}
         * @private
         */
        function _pieInit(datas) {
            var datalist = [];
            var labelList = [];
            var total = 0;
            if (datas === undefined || datas.length < 1) {
                labelList.push('近期无工作记录');
                datalist.push(100);
            } else {
                /**
                 * @typedef projectItem
                 * @property {string} name 
                 * @property {Number} value 
                 */
                var tmpList = [];
                for (var i = 0; i < datas.length; i++) {
                    total += datas[i].duration;
                    /**
                     * type projectItem
                     */
                    var projectItem = {
                        name: datas[i].projectCName,
                        value: datas[i].duration
                    };
                    if (labelList.indexOf(datas[i].projectCName) < 0) {
                        labelList.push(datas[i].projectCName);
                    }
                    var isExist = false;
                    for (var j = 0; j < tmpList.length; j++) {
                        if (tmpList[j].name === datas[i].projectCName) {
                            tmpList[j].value += datas[i].duration;
                            isExist = true;
                            break;
                        }
                    } 
                    if (!isExist) {
                        tmpList.push(projectItem);
                    }
                }

                for (var k = 0; k < tmpList.length; k++) {
                    datalist.push(Number((tmpList[k].value / total) * 100).toFixed(0));
                }
            }

            var conifg = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: datalist,
                        backgroundColor: [
                            "#F7464A",
                            "#46BFBD",
                            "#FDB45C",
                            "#949FB1",
                            "#4D5360",
                        ],
                    }],
                    labels: labelList
                },
                options: {
                    responsive: true,

                }
            };
            return new Chart(ctxByPj, conifg);
        }

    }

    /**
     * 项目统计对象.
     * @typedef {Object} ProjectStaticObj
     * @property {string} _id - 项目id
     * @property {string} cnName - 项目中文名
     * @property {string} enName - 项目英文名
     * @property {string} type - 项目类型 （自研 or 工程）
     * @property {string} about - 关于信息
     * @property {boolean} isClosed - 项目关闭标识
     * @property {Number} totalWorkDone - 项目总体工作量
     * @property {Number} myWorkDone - 个人在项目中的工作总量
     * @property {Number} percent - 百分比
     */
})();