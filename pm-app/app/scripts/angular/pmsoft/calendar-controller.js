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


        //初始化
        self.initData = _initData;

        /**
         * 初始化函数
         * @private
         */
        function _initData() {
            if (window.location.hash !== "#/calendar") {
                return;
            }
            self.account = $cookies.get('account');
            myCalendar.fullCalendar({
                //today: '2016-12-01',
                /*汉化部分*/
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                today: ["今天"],
                defaultView: 'month',
                firstDay: 1,
                buttonText: {
                    today: '本月',
                    month: '月',
                    week: '周',
                    day: '日',
                    prev: '上一月',
                    next: '下一月'
                },

                aspectRatio: 1.35,//单元格宽与高度的比值
                viewDisplay: function (view) {//动态把数据查出，按照月份动态查询
                    //_getCalendarInfo();
                },
                loading: function (bool) {
                    //载入函数
                    /* if (bool) $('#loading').show();
                     else $('#loading').hide();*/
                },
                events: function (start, end, timezone, callback) {
                    _returnJson(start, end, callback);
                },
                eventClick: function (event) {
                    //点击事件
                },
                eventRender: function (event, element) {
                    //重置title样式
                    var evtcontent = '<div class="fc-event-vert" style="color:white;"> ';
                    evtcontent = evtcontent + '<span class="fc-event-titlebg" style="cursor:pointer">' + event.title + '</span>';
                    element.html(evtcontent);
                }

            });
            //初次获取
            //_getCalendarInfo();

        }

        /**
         * 根据开始结束时间 调用API获取工作记录，并返回赋值给日历框体
         * @param start
         * @param end
         * @param callback
         * @private
         */
        function _returnJson(start, end, callback) {
            var condition = {};
            condition.username = self.account;
            condition.startDate = moment(start).format("YYYY-MM-DD");
            condition.endDate = moment(end).format("YYYY-MM-DD");
            //只获取当前的
            PMSoftServices.getJobList(condition, function (data) {
                var m_JobList = data.doc;
                //删除当前显示
                var m_event = [];
                $.each(m_JobList, function (index, term) {
                    var StartTime = term.starTime;
                    var endTime = term.endTime;
                    var projectName = term.projectCName;
                    //详情存入detail
                    var m_newevent = {
                        title: projectName,
                        start: StartTime,
                        end: endTime,
                        detail: term
                    };
                    m_event.push(m_newevent);
                });
                myCalendar.fullCalendar('removeEvents');
                callback(m_event);
                return true;
            }, function (err) {
                callback([]);
                return false;
            });
        }

    }

})();