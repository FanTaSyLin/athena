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
        var sysconfig = {};
        var account = "";
        var departmentID = "";
        var departmentName = "";
        var sharingEdit = angular.element(document.getElementById('sharingEdit'));
        var ctxByDay = angular.element(document.getElementById('department-Chart-ByDay'));
        var memberNav = angular.element(document.getElementById('memberNav'));
        var departmentNav = angular.element(document.getElementById('departmentNav'));
        var dateSelectArea = angular.element(document.getElementById('dateSelectArea'));
        /*详情弹窗*/
        var jobDetail = angular.element(document.getElementById('jobDetail'));

        /*是否为当前部门经理 初始化时候配置 用于判断显示*/
        var is_dptManager = false;

        self.account = "";
        /*当前显示的工作记录*/
        self.currentJob = {};
        self.members = [];
        self.myBar = undefined;
        self.profileNavCurrentItem = "Active";
        self.selectedMemberAccount = "all";
        self.departmentLogs = [];
        self.displayLogs = [];
        self.pageNum = 1;
        self.isShowShowMoreAcitivtyBtn = true;
        self.departments = [];
        self.isShowDptNav = false;
        self.selectedDepartment = {};
        self.sortType = "VarDate";
        self.sharingRange = "所有分享";
        self.sharings = [];
        self.currentSharing = {};
        self.sharingDetail = undefined;
        self.authorIsMe = false;
        self.membersStatics = [];
        self.staticRangeTitle = "";
        self.monthRange = {
            startDate: new Date(),
            endDate: new Date()
        };
        self.showStaticsTab = false;

        self.initData = _initData;
        self.openThisMemberInfo = _openThisMemberInfo;
        self.profileNavIsSeleced = _profileNavIsSeleced;
        self.selectProfileNavItem = _selectProfileNavItem;
        self.selectDetartment = _selectDetartment;
        self.memberItemIsSelected = _memberItemIsSelected;
        self.selectMemberItem = _selectMemberItem;
        self.isShowArea = _isShowArea;
        self.showMoreActivity = _showMoreActivity;
        self.showActivityDetial = _showActivityDetial;
        self.isSelectedDepartment = _isSelectedDepartment;
        self.selectSortType = _selectSortType;
        self.isSelectedSortType = _isSelectedSortType;
        self.selectSharingRange = _selectSharingRange;
        self.startYearAdd = _startYearAdd;
        self.startYearSubstract = _startYearSubstract;
        self.startMonthAdd = _startMonthAdd;
        self.startMonthSubstract = _startMonthSubstract;
        self.endYearAdd = _endYearAdd;
        self.endYearSubstract = _endYearSubstract;
        self.endMonthAdd = _endMonthAdd;
        self.endMonthSubstract = _endMonthSubstract;

        self.slectArticle = _slectArticle;
        self.ArticeSelected = _ArticeSelected;


        /*格式化时间 + 日期 格式*/
        self.formatDateTime = _formatDateTime;
        /*取消审核模态框*/
        self.disMissModal = _disMissModal;
        /**
         * 选择分享列表中的对象
         */
        self.selectSharingItem = _selectSharingItem;
        /**
         * 判断分享对象是否是已选中的对象
         */
        self.sharingItemIsSelected = _sharingItemIsSelected;
        /**
         * 显示编辑分享对话框
         */
        self.showSharingEdit = _showSharingEdit;
        /**
         * 删除分享内容
         */
        self.deleteSharing = _deleteSharing;
        /**
         * 设置置顶
         */
        self.pinSharing = _pinSharing;
        /**
         * 在新窗口中打开分享内容
         */
        self.newWindowSharing = _newWindowSharing;
        /**
         * 将分享内容设置为隐私或公开状态
         */
        self.setPrivacySharing = _setPrivacySharing;

        PMSoftServices.onNewSharingSubmited = _getSharings;

        PMSoftServices.onSharingEdited = _updateSharingList;

        //当 collapse 隐藏时 触发查询
        dateSelectArea.on('hidden.bs.collapse', function () {
            var tmpMembers = [];
            self.members.forEach(function (member) {
                tmpMembers.push(member.account);
            });
            _getDptWorkStatic(self.monthRange.startDate, self.monthRange.endDate, tmpMembers);
        });

        function _startYearAdd() {
            self.monthRange.startDate = self.monthRange.startDate.add(1, 'Y');
        }

        function _startYearSubstract() {
            self.monthRange.startDate = self.monthRange.startDate.add(-1, 'Y');
        }

        function _startMonthAdd() {
            self.monthRange.startDate = self.monthRange.startDate.add(1, 'M');
        }

        function _startMonthSubstract() {
            self.monthRange.startDate = self.monthRange.startDate.add(-1, 'M');
        }

        function _endYearAdd() {
            self.monthRange.endDate = self.monthRange.endDate.add(1, 'Y');
        }

        function _endYearSubstract() {
            self.monthRange.endDate = self.monthRange.endDate.add(-1, 'Y');
        }

        function _endMonthAdd() {
            self.monthRange.endDate = self.monthRange.endDate.add(1, 'M');
        }

        function _endMonthSubstract() {
            self.monthRange.endDate = self.monthRange.endDate.add(-1, 'M');
        }

        /**
         * @description 将分享内容设置为隐私或公开状态
         * @param {Object} sharingDetail
         */
        function _setPrivacySharing(sharingDetail) {
            var body = {};
            body._id = sharingDetail._id;
            body.privacyFlg = sharingDetail.privacyFlg;
            body.privacyFlg = !body.privacyFlg;
            PMSoftServices.setSharingPrivacy(body, function (res) {
                sharingDetail.privacyFlg = !sharingDetail.privacyFlg;
                for (var i = 0; i < self.sharings.length; i++) {
                    if (self.sharings[i]._id === sharingDetail._id) {
                        self.sharings[i].privacyFlg = sharingDetail.privacyFlg;
                        break;
                    }
                }
            }, function (res) {
                alert("设置失败，请检查网络并稍后再试。");
            });
        }

        /**
         * @description 在新窗口中打开分享内容
         */
        function _newWindowSharing(_id) {
            var url = 'pm-soft/sharingcontent?id=' + _id;
            window.open(url);
        }

        /**
         * @description 设置置顶
         * @param {Object} sharingDetail 分享内容详情
         */
        function _pinSharing(sharingDetail) {
            var body = {};
            body._id = sharingDetail._id;
            body.pinFlg = sharingDetail.pinFlg;
            body.pinFlg = !body.pinFlg;
            PMSoftServices.setSharingPin(body, function (res) {
                sharingDetail.pinFlg = !sharingDetail.pinFlg;
                for (var i = 0; i < self.sharings.length; i++) {
                    if (self.sharings[i]._id === sharingDetail._id) {
                        self.sharings[i].pinFlg = sharingDetail.pinFlg;
                        break;
                    }
                }
            }, function (res) {
                alert("设置失败，请检查网络并稍后再试。");
            });
        }

        function _updateSharingList(sharingItem) {
            for (var i = 0; i < self.sharings.length; i++) {
                if (self.sharings[i]._id === sharingItem._id) {
                    self.sharings[i].title = sharingItem.title;
                    self.sharings[i].varDate = sharingItem.varDate;
                }
            }
            _getSharingDetail(sharingItem._id);
        }

        function _deleteSharing(sharingDetail) {
            var body = {};
            body._id = sharingDetail._id;
            PMSoftServices.deleteSharing(body, function (res) {
                var index = self.sharings.indexOf(self.currentSharing);
                self.sharings.splice(index, 1);
                self.sharingDetail = {};
            }, function (res) {

            });
        }

        /**
         * @description 获取分享记录列表
         */
        function _getSharings() {

            var rangeType = "department";
            var departmentID = $cookies.get("department");

            PMSoftServices.getSharings(rangeType, departmentID, function (res) {
                var doc = res.doc;
                // self.sharings.splice(0, self.sharings.length);
                doc.forEach(function (item) {
                    var isExist = false;
                    for (var i = 0; i < self.sharings.length; i++) {
                        if (self.sharings[i]._id === item._id) {
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        item.showTime = moment(item.varDate).format("YYYY年MM月DD日");
                        self.sharings.push(item);
                    }
                });
                if (self.sharingDetail === undefined && self.sharings.length > 0) {
                    for (var i = 0; i < self.sharings.length; i++) {
                        if (self.sharings[i].privacyFlg === true && self.sharings[i].authorID !== account) {
                            continue;
                        } else {
                            _getSharingDetail(self.sharings[i]._id);
                            break;
                        }
                    }
                }
            }, function (res) {

            });
        }

        function _showSharingEdit(sharingDetail) {
            if (sharingDetail) {
                PMSoftServices.currentSharingDetail = {};
                PMSoftServices.currentSharingDetail = sharingDetail;
                PMSoftServices.currentSharingDetail.targetItem = {
                    id: departmentID,
                    name: departmentName,
                    type: "department"
                };
            } else {
                PMSoftServices.currentSharingDetail = undefined;
            }
            PMSoftServices.sharingTargets.splice(0, PMSoftServices.sharingTargets.length);
            PMSoftServices.sharingTargets.push({
                param: departmentID,
                name: departmentName,
                type: "department"
            });
            PMSoftServices.sharingTarget.param = departmentID;
            PMSoftServices.sharingTarget.name = departmentName;
            PMSoftServices.sharingTarget.type = "department";
            sharingEdit.modal({
                backdrop: 'static',
                keyboard: false
            });
        }

        /**
         * @description 判断分享对象是否是已选中的对象
         */
        function _sharingItemIsSelected(item) {
            return item._id === self.currentSharing._id;
        }

        /**
         * @description 选择分享列表中的对象
         */
        function _selectSharingItem(item) {
            var orgItem = self.currentSharing;
            self.currentSharing = item;
            if (orgItem !== item) {
                _getSharingDetail(self.currentSharing._id);
            }
        }

        function _getSharingDetail(_id) {
            PMSoftServices.getSharingDetail(_id, function (res) {
                self.sharingDetail = res.doc[0];
                if (account === self.sharingDetail.authorID) {
                    self.authorIsMe = true;
                } else {
                    self.authorIsMe = false;
                }
            }, function (res) {

            });
        }

        function _selectSharingRange(sharingRange) {
            self.sharingRange = sharingRange;
        }

        function _isSelectedSortType(sortType) {
            return self.sortType === sortType;
        }

        function _selectSortType(sortType) {
            self.sortType = sortType;
        }

        function _isSelectedDepartment(department) {
            return department.id === self.selectedDepartment.id;
        }

        function _selectDetartment(department) {
            self.selectedDepartment = department;

            /**
             * 刷新页面数据
             */
            _refreshData(department);
        }

        function _refreshData(department) {
            dptNum = department.id;
            _getPageData(dptNum, function () {
                if (self.profileNavCurrentItem === 'Static') {
                    self.membersStatics.splice(0, self.membersStatics.length);
                    self.members.forEach(function (item) {
                        var member = {
                            account: item.account,
                            name: item.name,
                            evaluation: {
                                // jobLogCount: 0,
                                // reviewedCount: 0
                            },
                            activity: {},
                            distribution: {}
                        };
                        self.membersStatics.push(member);
                    });
                    var tmpMembers = [];
                    self.members.forEach(function (member) {
                        tmpMembers.push(member.account);
                    });
                    _getDptWorkStatic(self.monthRange.startDate, self.monthRange.endDate, tmpMembers);
                }
            });
        }

        /**
         * @description 页面初始化函数 运行于页面加载完成后
         * 既包括数据获取 也包括页面相关控件的初始化
         * @private
         */
        function _initData() {
            //  difficultyEditor.slider('setValue', 1);
            if (window.location.hash !== '#/department') {
                return;
            } else {

                sysconfig = $cookies.getObject('Sysconfig');
                account = $cookies.get('account');
                self.account = account;
                departmentID = $cookies.get("department");
                for (var i = 0; i < sysconfig[0].departments.length; i++) {
                    if (sysconfig[0].departments[i].id.toString() === departmentID) {
                        departmentName = sysconfig[0].departments[i].name;
                    }
                }

                var isManager = false;
                sysconfig[0].departmentGroups.forEach(function (departmentGroup) {
                    for (var i = 0; i < departmentGroup.manager.length; i++) {
                        var manager = departmentGroup.manager[i];
                        if (manager.account === account) {
                            isManager = true;
                            break;
                        }
                    }
                });

                self.isShowDptNav = isManager;

                self.departments = sysconfig[0].departments;

                departmentNav.affix({
                    offset: {
                        top: 100
                    }
                });

                memberNav.affix({
                    offset: {
                        top: 800
                    }
                });

                /**
                 * 获取是否为部门经理 软件中心，决定显示系数权限
                 */
                is_dptManager = _getIsManager() || isManager;
                self.showStaticsTab = is_dptManager;

                dptNum = $cookies.get('department');
                /**
                 * @description 获取部门成员列表， 根据列表内容获取工作记录， 根据工作记录（简化信息）生成曲线图
                 */
                _getPageData(dptNum, function () {
                    //初始化统计列表
                    self.membersStatics.splice(0, self.membersStatics.length);
                    self.members.forEach(function (item) {
                        var member = {
                            account: item.account,
                            name: item.name,
                            evaluation: {
                                // jobLogCount: 0,
                                // reviewedCount: 0
                            },
                            activity: {},
                            distribution: {}
                        };
                        self.membersStatics.push(member);
                    });
                });
                //生成标题
                var startDate = moment(new Date()).add(-1, 'M').startOf('month');
                var endDate = moment(new Date()).endOf('month');
                //初始化日期选择框
                self.monthRange.startDate = startDate;
                self.monthRange.endDate = endDate;

            }
        }

        /**
         * @description 获取成员的工作统计信息
         * @param {String} startDate yyyy-MM-dd
         * @param {String} endDate yyyy-MM-dd
         * @param {String[]} members
         * @private
         */
        function _getDptWorkStatic(startDate, endDate, members) {
            if (members.length == 0) {
                console.log(JSON.stringify(self.membersEvaluation));
                return;
            }
            var memberID = members.shift();
            _getMemberWorkStatic(startDate, endDate, memberID, function () {
                _getDptWorkStatic(startDate, endDate, members);
            });
        }

        function _getMemberWorkStatic(startDate, endDate, account, next) {
            PMSoftServices.getMemberJobEvaluation(account, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), function (data) {
                self.membersStatics.forEach(function (member) {
                    if (member.account === account) {
                        // member.evaluation.jobLogCount = data.doc[0].jobLogCount;
                        // member.evaluation.reviewedCount = data.doc[0].reviewedCount;
                        if (data.doc.length < 1) return;
                        for (var p in data.doc[0]) {
                            member.evaluation[p] = data.doc[0][p];
                        }
                    }
                });
                next();
            }, function (err) {
                next();
            });
        }

        /**
         * @description 获取部门成员列表， 根据列表内容获取工作记录， 根据工作记录（简化信息）生成曲线图 以及活动列表
         * @param dptNum
         * @private
         */
        function _getPageData(dptNum, next) {
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
                if (self.profileNavCurrentItem !== 'Active') return next();
                PMSoftServices.getJobList(condition, function (res) {

                    var doc = res.doc;
                    self.departmentLogs.splice(0, self.departmentLogs.length);
                    self.displayLogs.splice(0, self.displayLogs.length);
                    doc.forEach(function (item) {
                        // item.showTime = moment(item.reportTime).format('MM月DD日 YYYY HH:mm');
                        item.showTime = moment(item.starTime).format('MM月DD日 YYYY HH:mm');
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

                    next();

                }, function (res) {
                    next();
                });

            }, function (res) {
                next();
            });
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

                if (moment(startDateStr).add(i, "d").day() === 6) {
                    tmpStr = "周六";
                } else if (moment(startDateStr).add(i, "d").day() === 0) {
                    tmpStr = "周日";
                }

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
                        if ((data.name + "@" + data.account) === dataSetItem.label && moment(data.date).format("MM月DD日") === tmp) {
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

            if (self.myBar === undefined) {
                self.myBar = new Chart(ctxByDay, config);
            } else {
                self.myBar.destroy();
                self.myBar = new Chart(ctxByDay, config);
            }
            //return new Chart(ctxByDay, config);

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
         * @description 打开成员信息页面
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
            var orgItem = self.profileNavCurrentItem;
            self.profileNavCurrentItem = item;
            if (orgItem !== item) {
                if (item === "Shared") {
                    _getSharings();
                }
                if (item === "Static") {
                    var tmpMembers = [];
                    self.members.forEach(function (member) {
                        tmpMembers.push(member.account);
                    });
                    _getDptWorkStatic(self.monthRange.startDate, self.monthRange.endDate, tmpMembers);
                }
            }
        }

        function _isShowArea(item) {
            return self.profileNavCurrentItem === item;
        }

        function _memberItemIsSelected(memberAccount) {
            return memberAccount === self.selectedMemberAccount;
        }

        //增加
        function _ArticeSelected(article, memberAccount) {
            return (self.selectedMemberAccount === memberAccount && self.articlesect === article)
        }

        function _selectMemberItem(memberAccount) {
            self.articlesect = false
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

        //增加
        function _slectArticle(article, memberAccount) {
            self.selectedMemberAccount = memberAccount;
            self.articlesect = article
            self.displayLogs.splice(0, self.displayLogs.length);
            self.pageNum = 0;
            _showMoreArtiicle(article, memberAccount, self.pageNum);
        }


        //增加
        function _showMoreArtiicle(article, memberAccount, pageNum) {
            var count = 0;
            var start = pageNum * MAXNUMPREPAGE;
            var end = (pageNum + 1) * MAXNUMPREPAGE - 1;

            for (var i = 0; i < self.departmentLogs.length; i++) {
                if (memberAccount === self.departmentLogs[i].authorID && article == self.departmentLogs[i].projectCName) {

                    if (count >= start && count <= end) {
                        self.displayLogs.push(self.departmentLogs[i]);
                    }

                    count++;
                }
            }
            if (count < end) {
                self.isShowShowMoreAcitivtyBtn = false;
            }
            self.pageNum++;
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
         * 清除html标签
         * @param str
         * @returns {*}
         * @private
         */
        function _delHtmlTag(str) {
            var tmpStr = str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
            tmpStr = tmpStr.replace(/&NBSP;/g, "");
            tmpStr = tmpStr.replace(/&nbsp;/g, "");
            if (tmpStr.length > 130) {
                tmpStr = tmpStr.substring(0, 130) + '...';
            }
            return tmpStr;
        }
    }

    var ColourSystem = [{
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

})();