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
        var MAXNUMPREPAGE = 30;
        var dptNum = 0;
        var ctxByDay = angular.element(document.getElementById('department-Chart-ByDay'));
        var memberNav = angular.element(document.getElementById('memberNav'));
        /*详情弹窗*/
        var jobDetail = angular.element(document.getElementById('jobDetail'));

        /*是否为当前部门经理 初始化时候配置 用于判断显示*/
        var is_dptManager = false;
        self.currentJob = {};
        /*当前显示的工作记录*/

        self.members = [];
        self.profileNavCurrentItem = "Active";
        self.selectedMemberAccount = "all";
        self.departmentLogs = [];
        self.displayLogs = [];
        self.pageNum = 1;
        self.isShowShowMoreAcitivtyBtn = true;
        self.initData = _initData;
        self.openThisMemberInfo = _openThisMemberInfo;
        self.profileNavIsSeleced = _profileNavIsSeleced;
        self.selectProfileNavItem = _selectProfileNavItem;
        self.memberItemIsSelected = _memberItemIsSelected;
        self.selectMemberItem = _selectMemberItem;
        self.isShowArea = _isShowArea;
        self.showMoreActivity = _showMoreActivity;
        self.showActivityDetial = _showActivityDetial;
        /*格式化时间 + 日期 格式*/
        self.formatDateTime = _formatDateTime;
        self.disMissModal = _disMissModal;
        /*取消审核模态框*/

        function _initData() {
            //  difficultyEditor.slider('setValue', 1);
            if (window.location.hash !== '#/department') {
                return;
            } else {

                memberNav.affix({
                    offset: {
                        top: 800
                    }
                });

                dptNum = $cookies.get('department');
                /**
                 * @description 获取部门成员列表， 根据列表内容获取工作记录， 根据工作记录（简化信息）生成曲线图
                 */
                PMSoftServices.getDepartmentMembers(dptNum, function (res) {

                    var doc = res.doc;
                    var timeSpan = 45;
                    var memberIDs = "";
                    var endDateStr = moment.utc().format('YYYY-MM-DD');
                    var startDateStr = moment.utc().add(-timeSpan, "d").format('YYYY-MM-DD');
                    self.members.splice(0, self.members.length);
                    for (var i = 0; i < doc.length; i++) {
                        memberIDs += doc[i].account + " ";
                        self.members.push(doc[i]);
                    }

                    var condition = {};
                    condition.username = memberIDs;
                    condition.startDate = startDateStr;
                    condition.endDate = endDateStr;

                    PMSoftServices.getJobList(condition, function (res) {

                        var doc = res.doc;
                        self.departmentLogs.splice(0, self.departmentLogs.length);
                        doc.forEach(function (item) {
                            item.showTime = moment(item.reportTime).add(8, "h").format('MM月DD日 YYYY HH:mm');
                            self.departmentLogs.push(item);
                            if (self.displayLogs.length < MAXNUMPREPAGE) {
                                self.displayLogs.push(item);
                            }
                        });
                        /**
                         * @description 处理这些数据 并显示
                         */
                        _lineInit(startDateStr, timeSpan, doc);

                        _memberActiveStatics(doc);

                    }, function (res) {

                    });

                }, function (res) {

                });

                //默认为非项目经理
                is_dptManager = false;
                //获取当前account
                var m_Account = $cookies.get('account');
                //部门整体配置
                var m_Sysconfig = $cookies.getObject('Sysconfig');
                //系统配置中获取部门配置
                var m_departments = m_Sysconfig[0].departments;
                //判断是否为当前显示部门的部门经理
                for (var i = 0; i < m_departments.length; i++) {
                    var this_Dptgroup = m_departments[i].id;
                    var this_manager = m_departments[i].manager.account;
                    //string 强等于
                    if (this_Dptgroup.toString() === dptNum.toString()
                        && this_manager.toString() === m_Account.toString()) {
                        is_dptManager = true;
                    }
                }

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
                var isExist = false;
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
                dataSetItem.borderColor = ColourSystem[i % 10].borderColor;
                dataSetItem.backgroundColor = ColourSystem[i % 10].backgroundColor;
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
            };
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
                        if (member.activeList.indexOf(data.projectCName) < 0 && member.activeList.length < 4) {
                            member.activeList.push(data.projectCName);
                        }
                    }
                }
            }
        }

        /**
         *
         * @param member
         * @private
         */
        function _openThisMemberInfo(member) {
            var url = 'pm-soft/memberstatus?memberid=' + member.account;
            window.open(url);
        }

        function _profileNavIsSeleced(item) {
            return (self.profileNavCurrentItem === item);
        }

        function _selectProfileNavItem(item) {
            self.profileNavCurrentItem = item;
        }

        function _isShowArea(item) {
            return self.profileNavCurrentItem === item;
        }

        function _memberItemIsSelected(memberAccount) {
            return memberAccount === self.selectedMemberAccount;
        }

        function _selectMemberItem(memberAccount) {
            var org = self.selectedMemberAccount;
            self.selectedMemberAccount = memberAccount;
            if (org === memberAccount) {
                return;
            } else {
                self.pageNum = 0;
                self.displayLogs.splice(0, self.displayLogs.length);
                _showMoreActivity(self.selectedMemberAccount, self.pageNum);
            }
        }

        //点击显示更多信息
        function _showMoreActivity(memberAccount, pageNum) {
            var count = 0;
            var start = pageNum * MAXNUMPREPAGE;
            var end = (pageNum + 1) * MAXNUMPREPAGE - 1;
            if (memberAccount === "all") {
                for (var i = 0; i < self.departmentLogs.length; i++) {
                    if (count >= start && count <= end) {
                        self.displayLogs.push(self.departmentLogs[i]);
                    }
                    count++;
                }
                if (count < end) {
                    self.isShowShowMoreAcitivtyBtn = false;
                }
            } else {
                for (var i = 0; i < self.departmentLogs.length; i++) {
                    if (memberAccount === self.departmentLogs[i].authorID) {
                        if (count >= start && count <= end) {
                            self.displayLogs.push(self.departmentLogs[i]);
                        }
                        count++;
                    }
                }
                if (count < end) {
                    self.isShowShowMoreAcitivtyBtn = false;
                }
            }
            self.pageNum++;
        }

        //点击显示选择信息详情
        function _showActivityDetial(logDetial) {

            //初始化设置，为false
            self.currentJob = logDetial;
            //是否显示系数与是否显示部门经理一致
            self.currentJob.isReviewer = is_dptManager;
            //显示详情窗体
            jobDetail.modal();

            /*  todo 通过详情
             PMSoftServices.getJobDetailByID(m_logID,
             function (res) {
             self.currentJob =  res.doc[0];
             //是否显示系数与是否显示部门经理一致
             self.currentJob.isReviewer = is_dptManager;
             jobDetail.modal( );
             }, function (err) {
             });*/


        }

        function _disMissModal() {
            //location.reload();
            /**
             * @description 这里要做的其实不是刷新页面 而是重新筛选数据 把现有数据中的 "已审核的" 以及 "已拒绝的" 过滤掉
             * 其实可以考虑用 filter
             */
            /**
             * 关闭页面、提交审核、提交拒绝、打开页面时 应初始化 审核系数
             */

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
    ];

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

})
();