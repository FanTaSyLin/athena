/**
 * Created by FanTaSyLin on 2017/1/11.
 */

(function () {

    "use strict";

    angular.module("MemberStatus")
        .controller("MemberStatusController", MemberStatusControllerFn);

    MemberStatusControllerFn.$inject = ["$cookies", "MemberStatusServices"];

    function MemberStatusControllerFn($cookies, MemberStatusServices) {

        var MAXNUMPREPAGE = 15;//一次获取的工作记录条目个数
        var self = this;
        var cookiesAccount = $cookies.get("account");
        var sysconfig = $cookies.getObject("Sysconfig");
        var account = "";
        var dptNum = 0;
        var projectNav = angular.element(document.getElementById('projectNav'));
        var memberCalendar = angular.element(document.getElementById("memberCalendar"));
        //详情对话框
        var jobDetail = angular.element(document.getElementById('jobDetail'));
        //是否可以看系数 默认为false
        var is_dptManager = false;

        self.isIam = false;
        self.member = {};
        self.projectList = [];
        self.profileNavCurrentItem = "Active";
        self.selectedProjectID = "all";
        self.isShowShowMoreAcitivtyBtn = true;
        self.jobLogs = [];
        self.pageNum = 0;

        self.initData = _initData;
        self.profileNavIsSeleced = _profileNavIsSeleced;
        self.selectProfileNavItem = _selectProfileNavItem;
        self.projectItemIsSelected = _projectItemIsSelected;
        self.selectProjectItem = _selectProjectItem;
        self.showMoreActivity = _showMoreActivity;
        self.openThisProject = _openThisProject;
        //查看活动详情
        self.showActivityDetial = _showActivityDetial;
        self.formatDateTime = _formatDateTime;

        function _initData() {

            account = _getQueryString("memberid");


            projectNav.affix({
                offset: {
                    top: 1200
                }
            });

            if (account === cookiesAccount) {
                self.isIam = true;
            }

            dptNum = $cookies.get('department');

            /**
             * 获取成员的详细信息
             */
            MemberStatusServices.getMemberInfo(account, function (res) {

                var doc = res;
                var member = (doc.length > 0) ? doc[0] : null;
                for (var p in member) {
                    self.member[p] = member[p];
                }

                /**
                 * 当时就不该存ID 蛋疼
                 */
                for (var i = 0; i < sysconfig[0].departments.length; i++) {
                    if (sysconfig[0].departments[i].id.toString() === self.member.department) {
                        self.member.department = sysconfig[0].departments[i].name;
                    }
                }

                document.title = self.member.name + "的个人信息";

            }, function (res) {

            });

            /**
             * 获取所有参与项目的相关信息
             */
            _getProjectStatic(account);
            //权限配置 默认为false
            is_dptManager = _getIsManager();

            /*初始化日历信息部分*/

            self.account = $cookies.get('account');
            memberCalendar.fullCalendar({
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
                    //重置title样式 由于个人界面日历较小 故对title进行简化
                    var evtcontent = '<div class="fc-event-vert" style="color:white;"> ';
                    var m_title = event.title;
                    // var m_length = event.title.replace(/[^\x00-\xff]/g, "01").length;
                    if (m_title.length > 10) {
                        m_title = m_title.substring(0, 10) + "...";
                    }
                    evtcontent = evtcontent + '<span class="fc-event-titlebg" style="cursor:pointer;overflow: hidden">' + m_title + '</span>';
                    element.html(evtcontent);
                }
            });
        }

        /**
         * @description 获取地址栏参数
         * @param {string} paramName
         * @return {string|null} paramValue
         * @private
         */
        function _getQueryString(paramName) {
            var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)return unescape(r[2]);
            return null;
        }

        /**
         * 获取项目统计信息（个人工作量在全项目中的占比，以及个人在项目中的总工作量）
         * @param account 账号
         * @return
         * @private
         */
        function _getProjectStatic(account) {
            //获取参与项目的列表
            MemberStatusServices.getPastProjects(account, function (data) {
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

                //根据已经获取的列表获取统计信息
                MemberStatusServices.getProjectStaticByAccount(account, projectIDs, function (res) {

                    /**
                     * @type {Object[]}
                     */
                    var data = res.doc;
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < self.projectList.length; j++) {
                            if (data[i].projectID === self.projectList[j]._id) {
                                self.projectList[j].myWorkDone = data[i].myWorkDone;
                                self.projectList[j].totalWorkDone = data[i].totalWorkDone;
                                var precent = 0;
                                if (self.projectList[j].totalWorkDone !== 0) {
                                    precent = ((self.projectList[j].myWorkDone / self.projectList[j].totalWorkDone) * 100).toFixed(0)
                                }
                                self.projectList[j].percent = precent;
                            }
                        }
                    }
                }, function (res) {

                });

                /**
                 * @description 获取项目组成员的工作记录
                 * 根据条件首次获取定量的条目             *
                 */
                self.pageNum = 0;
                var skipNum = self.pageNum * MAXNUMPREPAGE;
                var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
                _getProjectJobLogs("all", skipNum, limitNum);

            }, function (res) {

            });
        }

        /**
         * @description 判断是否选中了该 TabPage
         * @param {string} item TabPage的标识
         * @return {boolean}
         * @private
         */
        function _profileNavIsSeleced(item) {
            return (self.profileNavCurrentItem === item);
        }

        /**
         * @description 将传入的TabPage设置为选中状态
         * @param {string} item TabPage的标识
         * @private
         */
        function _selectProfileNavItem(item) {
            self.profileNavCurrentItem = item;
        }

        function _projectItemIsSelected(projectID) {
            return projectID === self.selectedProjectID;
        }

        function _selectProjectItem(projectID) {
            var org = self.selectedProjectID;
            self.selectedProjectID = projectID;
            if (org === projectID) {
                return;
            } else {
                self.jobLogs.splice(0, self.jobLogs.length);
                self.pageNum = 0;
                var skipNum = self.pageNum * MAXNUMPREPAGE;
                var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
                _getProjectJobLogs(self.selectedProjectID, skipNum, limitNum);
            }
        }

        /**
         * 获取项目组成员的工作记录
         * @param projectID
         * @param skipNum
         * @param limitNum
         * @private
         */
        function _getProjectJobLogs(projectID, skipNum, limitNum) {
            var projectIDs = [];
            if (projectID !== "all") {
                projectIDs.push(projectID);
            }
            MemberStatusServices.getJobLogs(account, projectIDs, skipNum, limitNum, function (res) {
                var doc = res.doc;
                var count = 0;
                doc.forEach(function (item) {
                    item.showTime = moment(item.reportTime).add(8, "h").format('MM月DD日 YYYY HH:mm');
                    item.cleanContent = _delHtmlTag(item.content);
                    self.jobLogs.push(item);
                    count++;
                });
                if (count !== MAXNUMPREPAGE) {
                    self.isShowShowMoreAcitivtyBtn = false;
                } else {
                    self.isShowShowMoreAcitivtyBtn = true;
                }
                self.pageNum++;
            }, function (res) {

            });
        }

        function _showMoreActivity() {
            var skipNum = self.pageNum * MAXNUMPREPAGE;
            var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
            _getProjectJobLogs(self.selectedProjectID, skipNum, limitNum);
        }

        function _openThisProject(projectID) {
            var url = 'projectinfo?projectid=' + projectID;
            window.open(url);
        }

        /**
         * 获取是否有权限 查看当前页面内容-部门界面 根据account
         * @private
         */
        function _getIsManager() {
            //默认为非项目经理
            var is_Manager = false;
            //从 cookie中获取account Sysconfig
            var m_Account = $cookies.get('account');
            var m_Sysconfig = $cookies.getObject('Sysconfig');
            //系统配置中获取部门配置及中心配置
            var m_departments = m_Sysconfig[0].departments;
            var m_departmentGroups = m_Sysconfig[0].departmentGroups;

            //所有有权限的人的列表
            var m_accountList = [];
            //遍历部门
            m_departments.forEach(function (department) {
                //加入各个部门的部门经理
                m_accountList.push(department.manager.account);
                //若部门序号相同 则使用当前部门确定中心人员
                if (department.id.toString() === dptNum.toString()) {

                    //循环查找中心分组信息
                    m_departmentGroups.forEach(function (m_Group) {
                        //查找ID相同
                        if (m_Group.id == department.group) {
                            //遍历加入 中心人员
                            m_Group.manager.forEach(function (m_GroupmanagerNum) {
                                m_accountList.push(m_GroupmanagerNum.account);
                            });

                        }
                    });
                }


            });
            //根据account查找 是否有权限
            if (m_accountList.indexOf(m_Account) != -1) {
                is_Manager = true;
            }
            //返回状态
            return is_Manager;
        }


        /**
         * 查看活动详情
         * @param logDetial log 内容
         * @private
         */
        function _showActivityDetial(logDetial) {
            //初始化设置 设置当前显示工作内容
            self.currentJob = logDetial;
            //是否显示系数与是否显示部门经理一致
            self.currentJob.isReviewer = is_dptManager;
            //显示详情窗体
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
         * 根据开始结束时间 调用API获取工作记录，并返回赋值给日历框体
         * @param start
         * @param end
         * @param callback
         * @private
         */
        function _returnJson(start, end, callback) {
            var condition = {};
            condition.username = account;
            condition.startDate = moment(start).format("YYYY-MM-DD");
            condition.endDate = moment(end).format("YYYY-MM-DD");
            //只获取当前的
            MemberStatusServices.getJobList(condition, function (data) {
                var m_JobList = data.doc;
                //删除当前显示
                var m_event = [];
                $.each(m_JobList, function (index, term) {
                    var StartTime = moment(term.starTime).add(8, "h");
                    var endTime = moment(term.endTime).add(8, "h");
                    var projectName = term.projectCName;
                    //详情存入detail
                    var m_newevent = {
                        title: projectName,
                        start: StartTime,
                        end: endTime,
                        detail: term
                    };
                    console.log(JSON.stringify(m_newevent));
                    m_event.push(m_newevent);
                });
                memberCalendar.fullCalendar('removeEvents');
                callback(m_event);
                return true;
            }, function (err) {
                console.log(err);
                callback([]);
                return false;
            });
        }

        /**
         * 清除html标签
         * @param str
         * @returns {*}
         * @private
         */
        function _delHtmlTag(str) {
            var tmpStr = str.replace(/<[^>]+>/g, "");//去掉所有的html标记
            tmpStr = tmpStr.replace(/&NBSP;/g, "");
            tmpStr = tmpStr.replace(/&nbsp;/g, "");
            if (tmpStr.length > 130) {
                tmpStr = tmpStr.substring(0, 130) + '...';
            }
            return tmpStr;
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