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
        var dptNum = 0;
        var ctxByDay = angular.element(document.getElementById('department-Chart-ByDay'));

        self.members = [];
        self.initData = _initData;

        function _initData() {
            if (window.location.hash !== '#/department') {
                return;
            } else {

                dptNum = $cookies.get('department');
                /**
                 * @description 获取部门成员列表， 根据列表内容获取工作记录， 根据工作记录（简化信息）生成曲线图
                 */
                PMSoftServices.getDepartmentMembers(dptNum, function (res) {

                    var doc = res.doc;
                    var timeSpan = 30;
                    var memberIDs = "";
                    var endDateStr = moment.utc().format('YYYY-MM-DD');
                    var startDateStr = moment.utc().add(-timeSpan, "d").format('YYYY-MM-DD');
                    self.members.splice(0, self.members.length);
                    for (var i = 0; i < doc.length; i++) {
                        memberIDs += doc[i].account + " ";
                        self.members.push(doc[i]);
                    }

                    var condition = {}
                    condition.username = memberIDs;
                    condition.startDate = startDateStr;
                    condition.endDate = endDateStr;

                    PMSoftServices.getJobList(condition, function (res) {

                        var doc = res.doc;

                        /**
                         * @description 处理这些数据 并显示
                         */
                        _lineInit(startDateStr, timeSpan, doc);

                        _memberActiveStatics(doc);

                    }, function (res) {

                    });

                }, function (res) {

                });
            }
        }

        /**
         * @description 绘制曲线图
         * @param {string} startDateStr 起始日期
         * @param {Number} timeSpan 时间跨度
         * @param {Object[]} datas 数据
         * @private
         */
        function _lineInit(startDateStr, timeSpan, datas) {

            var xLabels = [];
            /**
             * @type {baseData[]}
             */
            var baseDataList = [];

            //生成x轴标签列表
            for (var i = 0; i <= timeSpan; i++) {
                var tmpStr = moment(startDateStr).add(i, "d").format("MM月DD日");
                xLabels.push(tmpStr);
            }

            /**
             * 根据日期账号 先合并数据
             */
            for (var i = 0; i < datas.length; i++) {
                var isExist = false
                for (var j = 0; j < baseDataList.length; j++) {
                    if (baseDataList[j].account === datas[i].authorID && baseDataList[j].date === datas[i].date) {
                        baseDataList[j].duration_Real += datas[i].duration;
                        baseDataList[j].duration_Checked += (datas[i].reviewerID === "") ? 0 : datas[i].duration * datas[i].factor;
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    /**
                     * @type {baseData}
                     */
                    var item = {};
                    item.name = datas[i].authorName;
                    item.account = datas[i].authorID;
                    item.date = datas[i].date;
                    item.duration_Real = datas[i].duration;
                    item.duration_Checked = (datas[i].reviewerID === "") ? 0 : datas[i].duration * datas[i].factor;
                    baseDataList.push(item);
                }
            }

            /**
             * @type {dataSet[]}
             */
            var dataSets = [];

            for (var i = 0; i < self.members.length; i++) {
                /**
                 * @type {dataSet}
                 */
                var dataSetItem = {};
                dataSetItem.label = self.members[i].name + "@" + self.members[i].account;
                dataSetItem.data = [];
                for (var j = 0; j <= timeSpan; j++) {
                    var tmp = moment(startDateStr).add(j, "d").format("MM月DD日");
                    var isExist = false;
                    for (var k = 0; k < baseDataList.length; k++) {
                        var data = baseDataList[k];
                        if ((data.name + "@" + data.account) === dataSetItem.label && moment(data.date).add(8, "h").format("MM月DD日") === tmp) {
                            dataSetItem.data.push(data.duration_Real);
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        dataSetItem.data.push(0);
                    }
                }
                dataSetItem.borderColor = ColourSystem[i%10].borderColor;
                dataSetItem.backgroundColor = ColourSystem[i%10].backgroundColor;
                dataSetItem.pointBorderColor = "rgba(255, 255, 255 , 1)";
                dataSetItem.pointBackgroundColor = "rgba(141, 68, 173 , 0.7)";
                dataSetItem.pointBorderWidth = 2;

                var total = 0;
                for (var l = 0; l < dataSetItem.data.length; l++) {
                    total += dataSetItem.data[l];
                }
                if (total > 0) {
                    dataSets.push(dataSetItem);
                }
            }

            var config = {
                type: 'line',
                data: {
                    labels: xLabels,
                    datasets: dataSets
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
         *
         * @param datas
         * @private
         */
        function _memberActiveStatics(datas) {
            for (var i = 0; i < self.members.length; i++) {
                var member = self.members[i];
                member.activeList = [];
                for (var j = 0; j < datas.length; j++) {
                    var data = datas[j];
                    if (member.account === data.authorID) {
                        if (member.activeList.indexOf(data.projectCName) < 0) {
                            member.activeList.push(data.projectCName);
                        }
                    }
                }
            }
        }
    }

    var ColourSystem = [
        {
            borderColor: "rgba(154, 89, 181, 0.7)",
            backgroundColor: "rgba(154, 89, 181, 0.2)"
        },
        {
            borderColor: "rgba(255, 99, 132, 0.7)",
            backgroundColor: "rgba(255, 99, 132, 0.2)"
        },
        {
            borderColor: "rgba(54, 162, 235, 0.7)",
            backgroundColor: "rgba(54, 162, 235, 0.2)"
        },
        {
            borderColor: "rgba(255, 206, 86, 0.7)",
            backgroundColor: "rgba(255, 206, 86, 0.2)"
        },
        {
            borderColor: "rgba(75, 192, 192, 0.7)",
            backgroundColor: "rgba(75, 192, 192, 0.2)"
        },
        {
            borderColor: "rgba(153, 204, 102, 0.7)",
            backgroundColor: "rgba(153, 204, 102, 0.2)"
        },
        {
            borderColor: "rgba(255, 159, 64, 0.7)",
            backgroundColor: "rgba(255, 159, 64, 0.2)"
        },
        {
            borderColor: "rgba(153, 102, 102, 0.7)",
            backgroundColor: "rgba(153, 102, 102, 0.2)"
        },
        {
            borderColor: "rgba(102, 102, 153, 0.7)",
            backgroundColor: "rgba(102, 102, 153, 0.2)"
        },
        {
            borderColor: "rgba(102, 102, 102, 0.7)",
            backgroundColor: "rgba(102, 102, 102, 0.2)"
        }
    ]
    
    /**
     * 基础数据 根据账号、日期合并后的数据
     * @typedef {Object} baseData
     * @property {string} name 标签(员工姓名)
     * @property {string} account 账号
     * @property {string} date
     * @property {Number} duration_Real
     * @property {Number} duration_Checked
     */

    /**
     * @typedef {Object} dataSet
     * @property {string} label 姓名@账号
     * @property {Number[]} data
     * @property {Color} borderColor
     * @property {Color} backgroundColor
     * @property {Color|string} pointBorderColor
     * @property {Color|string} pointBackgroundColor
     * @property {Number} pointBorderWidth
     */

})();