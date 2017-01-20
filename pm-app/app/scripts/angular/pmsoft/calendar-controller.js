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
        var currentEvent = {};

        self.initData = _initData;

        /**
         * 初始化函数
         * @private
         */
        function _initData() {
            if (window.location.hash !== "#/calendar") {
                return;
            }
            //初始化
            myCalendar.fullCalendar({
                //
                now: new Date(),

                aspectRatio: 1.8,
                scrollTime: '00:00',
                schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
                //界面中文化
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                buttonText: {
                    today: '本月',
                    month: '月',
                    week: '周',
                    day: '日',
                    prev: '上一月',
                    next: '下一月'
                },
                editable: true,//判断该日程能否拖动
                views: {
                    timelineThreeDays: {
                        type: 'timeline',
                        duration: {days: 3}
                    }
                },
                events: [
                    {
                        id: '1',
                        resourceId: 'b',
                        start: '2016-12-07T02:00:00',
                        end: '2016-12-07T07:00:00',
                        color: '#111111',
                        title: 'event 1'
                    },
                    {
                        id: '2',
                        resourceId: 'c',
                        start: '2016-12-07T05:00:00',
                        end: '2016-12-07T22:00:00',
                        title: 'event 2'
                    },
                    {id: '3', resourceId: 'd', start: '2016-12-06', end: '2016-12-08', title: 'event 3'},
                    {
                        id: '4',
                        resourceId: 'e',
                        start: '2016-12-07T03:00:00',
                        end: '2016-12-07T08:00:00',
                        title: 'event 4'
                    },
                    {
                        id: '5',
                        resourceId: 'f',
                        start: '2016-12-07T00:30:00',
                        end: '2016-12-07T02:30:00',
                        title: 'event 5'
                    }
                ],
                eventMouseover: function (calEvent, jsEvent, view) {
                    /*  var fstart = $.fullCalendar.formatDate(calEvent.start, "yyyy/MM/dd HH:mm");
                     var fend = $.fullCalendar.formatDate(calEvent.end, "yyyy/MM/dd HH:mm");*/
                    var m_Start = moment(calEvent.start).format("HH:mm");
                    var m_end = moment(calEvent.end).format("HH:mm");
                    $(this).attr('title', m_Start + " - " + m_end + " " + "标题" + " : " + calEvent.title);
                    $(this).css('font-weight', 'normal');
                    $(this).tooltip({
                        effect: 'toggle',
                        cancelDefault: true
                    });
                },
                eventClick: function (event) {
                    alert(event);
                    self.currentEvent = event;
                    /*  var fstart = $.fullCalendar.formatDate(event.start, "HH:mm");
                     var fend = $.fullCalendar.formatDate(event.end, "HH:mm");
                     //  var schdata = { sid: event.sid, deleted: 1, uid: event.uid };
                     var selectdate = $.fullCalendar.formatDate(event.start, "yyyy-MM-dd");
                     $("#start").val(fstart);
                     ;
                     $("#end").datetimepicker('setDate', event.end);


                     $("#title").val(event.title); //标题
                     $("#details").val(event.description); //内容
                     $("#chengdu").val(event.confname); //重要程度


                     $("#reservebox").dialog({
                     autoOpen: false,
                     height: 450,
                     width: 400,
                     title: 'Reserve meeting room on ',
                     modal: true,
                     position: "center",
                     draggable: false,
                     beforeClose: function (event, ui) {
                     //$.validationEngine.closePrompt("#meeting");
                     //$.validationEngine.closePrompt("#start");
                     //$.validationEngine.closePrompt("#end");
                     $("#start").val(''); //开始时间
                     $("#end").val(''); //结束时间
                     $("#title").val(''); //标题
                     $("#details").val(''); //内容
                     $("#chengdu").val(''); //重要程度
                     },
                     timeFormat: 'HH:mm{ - HH:mm}',*/

                    /*   buttons: {
                     "删除": function () {
                     var aa = window.confirm("警告：确定要删除记录，删除后无法恢复！");
                     if (aa) {
                     var para = {id: event.id};


                     /!*  $.ajax({
                     type: "POST", //使用post方法访问后台

                     url: "http://www.cnblogs.com/sr/removedate.ashx", //要访问的后台地址
                     data: para, //要发送的数据
                     success: function (data) {
                     //对话框里面的数据提交完成，data为操作结果


                     $('#calendar').fullCalendar('removeEvents', event.id);
                     }


                     });*!/

                     }
                     $(this).dialog("close");
                     },
                     "reserve": function () {

                     /!*   var startdatestr = $("#start").val(); //开始时间
                     var enddatestr = $("#end").val(); //结束时间
                     var confid = $("#title").val(); //标题
                     var det = $("#details").val(); //内容
                     var cd = $("#chengdu").val(); //重要程度
                     var startdate = $.fullCalendar.parseDate(selectdate + "T" + startdatestr);
                     var enddate = $.fullCalendar.parseDate(enddatestr);

                     event.fullname = confid;
                     event.confname = cd;
                     event.start = startdate;
                     event.end = enddate;
                     event.description = det;
                     var id2;

                     var schdata = {
                     title: confid,
                     fullname: confid,
                     description: det,
                     confname: cd,
                     confshortname: 'M1',
                     start: selectdate + ' ' + startdatestr,
                     end: enddatestr,
                     id: event.id
                     };
                     $.ajax({
                     type: "POST", //使用post方法访问后台

                     url: "http://www.cnblogs.com/sr/Updateinfo.ashx", //要访问的后台地址
                     data: schdata, //要发送的数据
                     success: function (data) {
                     //对话框里面的数据提交完成，data为操作结果
                     var schdata2 = {
                     title: confid,
                     fullname: confid,
                     description: det,
                     confname: cd,
                     confshortname: 'M1',
                     start: selectdate + ' ' + startdatestr,
                     end: enddatestr,
                     id: event.id
                     };
                     $('#calendar').fullCalendar('updateEvent', event);
                     }
                     });
                     $(this).dialog("close");*!/
                     }

                     }*/
                    /*     });
                     $("#reservebox").dialog("open");
                     return false;*/
                }
            });
        }

    }

})();