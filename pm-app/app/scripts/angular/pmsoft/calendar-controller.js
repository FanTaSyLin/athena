/**
 * Created by FanTaSyLin on 2017/1/3.
 */
(function () {
    "use strict";
    angular.module("PMSoft")
        .controller("CalendarController", CalendarControllerFn);

    CalendarControllerFn.$inject = ["PMSoftServices", "$cookies"];

    function CalendarControllerFn(PMSoftServices, $cookies) {

        var self = this;
        var myCalendar = angular.element(document.getElementById("myCalendar"));
        var jobDetail = angular.element(document.getElementById('jobDetail'));
        /*左侧列表是否显示*/
        self.is_ListShow = true;
        //当前显示的列表
        self.projectevents = [];


        //项目列表
        self.projects = [];
        //关注列表
        self.follows = [];
        //其他列表
        self.others = [];
        //当前显示的工作列表
        self.events = [];


        self.showDetail = _showDetail;
        //初始化函数
        self.initData = _initData;
        /*格式化时间 + 日期 格式*/
        self.formatDateTime = _formatDateTime;
        self.disMissModal = _disMissModal;
        /*伸缩列表动画 函数 */
        self.listAnimation = _listAnimation;
        /*点击选择项目事件*/
        self.selectproject = _selectproject;

        /**
         * 初始化函数
         * @private
         */
        function _initData() {
            if (window.location.hash !== "#/calendar") {
                return;
            }
            //获取account
            self.account = $cookies.get('account');
            //日历配置
            myCalendar.fullCalendar({
                //today: '2016-12-01',
                /*汉化部分*/
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],

                now: moment(), /*设置初始化日期为当天*/
                timezone: 'local', /*时区转化 官网demo中无中国时区的例子 故使用当前时区local(东八区部分无beijing (只有Tokyo...)) */
                defaultView: 'month',
                header: {
                    left: 'title',
                    right: 'today prev,next  listYear,month,agendaWeek'
                },
                firstDay: 1,
                buttonText: {
                    listMonth: '月列表',
                    today: '本日',
                    agendaWeek: '周',
                    month: '月',
                    week: '周',
                    day: '日',
                    Year: '年',
                    list: '年'
                },
                aspectRatio: 1.35,//单元格宽与高度的比值
                viewDisplay: function (view) {
                    //动态把数据查出，按照月份动态查询
                    //_getCalendarInfo();
                },
                loading: function (bool) {
                    //载入函数
                    /* if (bool) $('#loading').show();
                     else $('#loading').hide();*/
                },
                resources: [
                    {id: 'a', title: '项目'}
                ],
                events: function (start, end, timezone, callback) {
                    _returnJson(start, end, callback);
                },
                eventClick: function (event) {
                    //点击事件 detailJob 绑定不上
                    _showDetail(event);
                },
                eventRender: function (event, element) {
                    //重置title样式（需要区分view）
                    /*  var evtcontent = '<div class="fc-event-vert" style="color:white;"> ';
                     evtcontent = evtcontent + '<span class="fc-event-titlebg" style="cursor:pointer">' + event.title + '</span>';
                     element.html(evtcontent);*/
                }
            });

            //日历左侧对应项目列表 及关注项目 活动显示 初始化
            _initProject();
        }

        /**
         * 获取当前参与项目列表
         * @private
         */
        function _initProject() {
            //初始化项目列表
            if (self.account && self.account.length > 0) {
                PMSoftServices.getPastProjects(self.account, function (data) {
                    data.forEach(function (project) {
                        self.projects.push(project);
                    });
                }, function (err) {
                    console.log(err);
                });
            }
        }

        /**
         * 根据开始结束时间 调用API获取工作记录，并返回赋值给日历框体 可以添加颜色信息
         * @param start
         * @param end
         * @param callback
         * @private
         */
        function _returnJson(start, end, callback) {
            var condition = {};
            //设置用户名
            condition.username = self.account;
            //设置开始结束时间
            condition.startDate = moment(start).format("YYYY-MM-DD");
            condition.endDate = moment(end).format("YYYY-MM-DD");
            //只获取当前的条件下的工作列表
            PMSoftServices.getJobList(condition, function (data) {
                var m_JobList = data.doc;
                //删除当前显示
                var m_event = [];
                //遍历 赋值 添加
                $.each(m_JobList, function (index, term) {
                    var StartTime = term.starTime;
                    var endTime = term.endTime;
                    var projectName = term.projectCName;
                    //详情存入detail
                    var m_newevent = {
                        title: projectName,
                        start: StartTime,
                        end: endTime,
                        resourceId: 'a',
                        detail: term
                    };
                    self.projectevents.push(m_newevent);
                    m_event.push(m_newevent);
                    self.events.push(m_newevent);
                });
                //重新加载events
                myCalendar.fullCalendar('removeEvents');
                callback(m_event);
                return true;
            }, function (err) {
                //返回空列表
                console.log(err);
                callback([]);
                return false;
            });
        }

        function _disMissModal() {

        }

        /**
         * 点击日历上事件 显示事件详情部分
         * @param event 日历事件 目前使用detail传递参数（是否需要传递那么多数据？目前只使用了项目名称 时间 详情部分 ）
         * @private
         */
        function _showDetail(event) {
            // 日历控件 中点击事件 对于angular 绑定不兼容 使用赋值方式更新 20170206
            //使用日历外按钮对绑定进行更新则可以赋值
            var m_contentDiv = angular.element(document.getElementById('jobDetail_content'));
            //创建html代码
            var innerHtml = '<h4><span class="glyphicon glyphicon-th-list" aria-hidden="true"></span> '
                + event.detail.projectCName
                + '</h4>'
                + "<hr>"
                + '<h4> <span class="glyphicon glyphicon-time" aria-hidden="true"></span>'
                + " " + moment(event.detail.starTime).format("YYYY年MM月DD日 HH:mm") + "-" + moment(event.detail.endTime).format(" HH:mm")
                + "</h4>"
                + "<hr>"
                + "<h4>"
                + '<label style="word-break: break-all;margin-top: 0.5em;">'
                + event.detail.content
                + "</label></h4>";
            //html代码赋值
            m_contentDiv.html(innerHtml);
            //拟态框显示
            jobDetail.modal();
        }

        /**
         * 日期 + 时间 格式化
         * @param DateTime
         * @returns {string}
         * @private
         */
        function _formatDateTime(DateTime) {
            return new Date(DateTime).toLocaleDateString() + ' ' + new Date(DateTime).toLocaleTimeString();
        }


        /**
         * 列表动画函数 对列表进行隐藏显示操作
         * @private
         */
        function _listAnimation() {
            //隐藏列表
            if (self.is_ListShow) {
                //隐藏
                _hideListFunc();
            }
            else {
                //显示
                _showListFunc();
            }

        }

        /**
         *显示项目列表
         * @private
         */
        function _showListFunc() {
            self.is_ListShow = true;//如果当前列表被隐藏 测显示
        }

        /**
         *隐藏项目列表
         * @private
         */
        function _hideListFunc() {
            self.is_ListShow = false;//如果当前显示列表 则隐藏
        }

        self._conditions = [];

        //选择项目点击事件
        function _selectproject(project) {
            //是否被选择
            var _id = project._id;
            var m_event = [];
            //遍历筛选事件
            self.events.forEach(function (m_item) {
                if (m_item.detail.projectID == _id) {
                    m_event.push(m_item);
                }
              });
            //刷新显示
            /*筛选 当前event*/
            myCalendar.fullCalendar('removeEvents');
            myCalendar.fullCalendar('addEventSource', m_event);
        }

    }

})();