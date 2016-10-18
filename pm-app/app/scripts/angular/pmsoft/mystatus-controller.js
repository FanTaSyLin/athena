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
        var ctxByDay = angular.element(document.getElementById('Chart-ByDay'));
        var ctxByPj = angular.element(document.getElementById('Chart-ByPj'));
        self.account = $cookies.get('account');

        init();

        function init() {

            var condition = {};
            var endDateStr = new Date();
            var startDateStr = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000);
            condition.username = self.account;
            condition.startDateStr = startDateStr.toISOString().substring(0, 10);
            condition.endDateStr = endDateStr.toISOString().substring(0, 10);

            //$http 存在一个BUG 就是当返回值为{}时 不触发success的函数。
            //因此，为了保证图表的正常显示，在获取数据前就要生成图表。
            var myLine = lineInit(startDateStr, 14);
            var myPie = pieInit();

            //获取近期工作记录
            PMSoftServices.getJobList(condition, function (data) {

                //TODO: 对获取到的数据进行处理
                //TODO: 生成图表数据
                //chartInit(data);
            }, function (data) {

            });
        }

        function lineInit(startDate, Num) {
            var labelList = [];
            var tmpDate = startDate
            for (var i = 0; i <= Num; i++) {
                var tmpStr = tmpDate.toISOString();
                tmpStr = tmpStr.substring(5, 7) + '月' + tmpStr.substring(8, 10) + '日';
                labelList.push(tmpStr);
                tmpDate = new Date(tmpDate.getTime() + 24 * 60 * 60 *1000);
            }


            var config = {
                type: 'line',
                data: {
                    labels: labelList,
                    datasets: [{
                        label: "工作量",
                        data: [10, 10, 9, 7, 15, 1, 6],
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
        
        function pieInit() {
            var conifg = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            40,
                            100,
                            25,
                            70,
                            190
                        ],
                        backgroundColor: [
                            "#F7464A",
                            "#46BFBD",
                            "#FDB45C",
                            "#949FB1",
                            "#4D5360",
                        ],
                    }],
                    labels: [
                        "Red",
                        "Green",
                        "Yellow",
                        "Grey",
                        "Dark Grey"
                    ]
                },
                options: {
                    responsive: true,

                }
            };
            return new Chart(ctxByPj, conifg);
        }
    }

})();