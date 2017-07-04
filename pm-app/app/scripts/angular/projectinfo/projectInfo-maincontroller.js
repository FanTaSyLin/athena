/**
 * Created by FanTaSyLin on 2016/11/4.
 */

(function () {

    'use strict';

    angular.module('ProjectInfo')
        .controller('ProjectInfo-MainController', MainControllerFn);

    MainControllerFn.$inject = ['$location', '$cookies', 'ProjectInfoServices'];


    function MainControllerFn($location, $cookies, ProjectInfoServices) {

        var MAXNUMPREPAGE = 30; //一次获取的工作记录条目个数
        var self = this;
        var myStar = [];
        var projectID = '';
        var account = '';
        var rmShowedMemberClickCount = 1; //用来记录移除成员时的点击次数
        /*是否为当前部门经理 初始化时候配置 用于判断显示*/
        var is_dptManager = false;
        var ctxByMember_Bar = angular.element(document.getElementById('Chart-ByMember-bar'));
        var ctxByMember_Pie = angular.element(document.getElementById('Chart-ByMember-pie'));
        var dateSelectArea = angular.element(document.getElementById('dateSelectArea'));
        var editProjectInfo = angular.element(document.getElementById('edit-project-info'));
        var memberStatusModal = angular.element(document.getElementById('member-status-modal'));
        var memberAddModal = angular.element(document.getElementById('member-add-modal'));
        var memberNav = angular.element(document.getElementById('memberNav'));
        var sharingEdit = angular.element(document.getElementById('sharingEdit'));

        /*详情弹窗*/
        var jobDetail = angular.element(document.getElementById('jobDetail'));


        /*当前显示的工作记录*/
        self.currentJob = {};
        self.isStarred = false;
        self.thisProject = {};
        self.thisProjectInfo = {};
        self.title = '';
        self.monthRange = {
            startDate: new Date(),
            endDate: new Date()
        };
        self.isShowMenu = false;
        self.showedMember = {};
        self.descriptionForRmBtn = '从项目组移除';
        self.iamManager = false;
        self.searchCondition = '';
        self.foundMembers = [];
        self.myBar = undefined;
        self.myPie = undefined;
        self.profileNavCurrentItem = "Active";
        self.selectedMemberAccount = "all";
        self.isShowShowMoreAcitivtyBtn = true;
        self.jobLogs = [];
        self.pageNum = 0;
        self.startDate = "";
        self.endDate = "";
        self.sortType = "VarDate";
        self.sharingRange = "所有分享";
        self.sharings = [];
        self.currentSharing = {};
        self.sharingDetail = undefined;
        self.authorIsMe = false;

        self.init = _init;
        self.starred = _starred;
        self.selectMonthRange = _selectMonthRange;
        self.startYearAdd = _startYearAdd;
        self.startYearSubstract = _startYearSubstract;
        self.startMonthAdd = _startMonthAdd;
        self.startMonthSubstract = _startMonthSubstract;
        self.endYearAdd = _endYearAdd;
        self.endYearSubstract = _endYearSubstract;
        self.endMonthAdd = _endMonthAdd;
        self.endMonthSubstract = _endMonthSubstract;
        self.showMenu = _showMenu;
        self.submitProjectInfo = _submitProjectInfo;
        self.cancelProjectInfo = _cancelProjectInfo;
        self.showMemberStatus = _showMemberStatus;
        self.setShowedMemberAuthority = _setShowedMemberAuthority;
        self.rmShowedMember = _rmShowedMember;
        self.openAddMemberModal = _openAddMemberModal;
        self.searchMembers = _searchMembers;
        self.addMemberToProject = _addMemberToProject;
        self.profileNavIsSeleced = _profileNavIsSeleced;
        self.selectProfileNavItem = _selectProfileNavItem;
        self.memberItemIsSelected = _memberItemIsSelected;
        self.selectMemberItem = _selectMemberItem;
        self.isShowArea = _isShowArea;
        self.showMoreActivity = _showMoreActivity;
        /*格式化时间 + 日期 格式*/
        self.formatDateTime = _formatDateTime;
        /*显示工作记录详情模态框*/
        self.showActivityDetial = _showActivityDetial;
        /**/
        self.selectedPType = _selectedPType;
        /*选择分享列表排序方式*/
        self.selectSortType = _selectSortType;
        /*判断是否选中了某个分享列表的排序方式*/
        self.isSelectedSortType = _isSelectedSortType;
        /*选择分享列表的可见范围*/
        self.selectSharingRange = _selectSharingRange;
        /*选择分享列表中的对象*/
        self.selectSharingItem = _selectSharingItem;
        /*判断分享对象是否是已选中的对象*/
        self.sharingItemIsSelected = _sharingItemIsSelected;
        /*显示编辑分享对话框*/
        self.showSharingEdit = _showSharingEdit;
        /*删除分享内容*/
        self.deleteSharing = _deleteSharing;
        /*定义 当成功提交了一个新的分享后调用的函数*/
        ProjectInfoServices.onNewSharingSubmited = _getSharings;
        /*定义 当成功提交了一个修改后调用的函数*/
        ProjectInfoServices.onSharingEdited = _updateSharingList;

        //当 collapse 隐藏时 触发查询
        dateSelectArea.on('hidden.bs.collapse', function () {
            _selectMonthRange();
        });

        /**
         * @desc 更新列表
         */
        function _updateSharingList(sharingItem) {
            for (var i = 0; i < self.sharings.length; i++) {
                if (self.sharings[i]._id === sharingItem._id) {
                    self.sharings[i].title = sharingItem.title;
                    self.sharings[i].varDate = sharingItem.varDate;
                }
            }
            _getSharingDetail(sharingItem._id);
        }

        /**
         * @desc 获取详细分享内容
         */
        function _getSharingDetail(_id) {
            ProjectInfoServices.getSharingDetail(_id, function (res) {
                self.sharingDetail = res.doc[0];
                if (account === self.sharingDetail.authorID) {
                    self.authorIsMe = true;
                } else {
                    self.authorIsMe = false;
                }
            }, function (res) {

            });
        }

        /**
         * @desc 获取分享记录列表
         */
        function _getSharings() {

            var rangeType = "project";
            var id = self.thisProject._id;

            ProjectInfoServices.getSharings(rangeType, id, function (res) {
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
                    _getSharingDetail(self.sharings[0]._id);
                }
            }, function (res) {

            });
        }

        /**
         * @desc 删除分享内容
         */
        function _deleteSharing(sharingDetail) {
            var body = {};
            body._id = sharingDetail._id;
            ProjectInfoServices.deleteSharing(body, function (res) {
                var index = self.sharings.indexOf(self.currentSharing);
                self.sharings.splice(index, 1);
                self.sharingDetail = {};
            }, function (res) {

            });
        }

        /**
         * @desc 显示编辑分享对话框
         */
        function _showSharingEdit(sharingDetail) {
            if (sharingDetail) {
                ProjectInfoServices.currentSharingDetail = {};
                ProjectInfoServices.currentSharingDetail = sharingDetail;
                ProjectInfoServices.currentSharingDetail.targetItem = {
                    id: self.thisProject.id,
                    name: self.thisProject.cnName,
                    type: "project"
                };
            } else {
                ProjectInfoServices.currentSharingDetail = undefined;
            }
            ProjectInfoServices.sharingTargets.splice(0, ProjectInfoServices.sharingTargets.length);
            ProjectInfoServices.sharingTargets.push({
                param: self.thisProject.id,
                name: self.thisProject.cnName,
                type: "project"
            });
            ProjectInfoServices.sharingTarget.param = self.thisProject._id;
            ProjectInfoServices.sharingTarget.name = self.thisProject.cnName;
            ProjectInfoServices.sharingTarget.type = "project";
            sharingEdit.modal({
                backdrop: 'static',
                keyboard: false
            });
        }

        /**
         * @desc 判断分享对象是否是已选中的对象
         */
        function _sharingItemIsSelected(item) {
            return item._id === self.currentSharing._id;
        }

        /**
         * @desc 选择分享列表中的对象
         */
        function _selectSharingItem(item) {
            var orgItem = self.currentSharing;
            self.currentSharing = item;
            if (orgItem !== item) {
                _getSharingDetail(self.currentSharing._id);
            }
        }

        /**
         * @desc 选择分享列表的可见范围
         */
        function _selectSharingRange(sharingRange) {
            self.sharingRange = sharingRange;
        }

        /**
         * @desc 判断是否选中了某个分享列表的排序方式
         */
        function _isSelectedSortType(sortType) {
            return self.sortType === sortType;
        }

        /**
         * @description 选择分享列表排序方式
         */
        function _selectSortType(sortType) {
            self.sortType = sortType;
        }

        function _selectedPType(type) {
            self.thisProjectInfo.type = type;
        }

        /**
         * 添加一个项目成员
         * @param {Object} member 成员
         */
        function _addMemberToProject(member) {
            ProjectInfoServices.addMemberToProject(projectID, member, function (res) {
                //成功后 添加到成员列表
                self.thisProject.members.push(member);
                //关闭 模态框
                memberAddModal.modal('hide');
            }, function (res) {
                //失败 最好能有原因提示
                alert(res);
            });
        }

        /**
         * 查询成员
         * @private
         */
        function _searchMembers($event, condition) {
            if ($event.keyCode !== 13) {
                return;
            }
            ProjectInfoServices.searchMembers(condition, function (res) {
                self.foundMembers.splice(0, self.foundMembers.length);
                res.forEach(function (member) {
                    self.foundMembers.push(member);
                });
            }, function (res) {

            });
        }

        /**
         * 打开添加项目成员的模态框
         * @private
         */
        function _openAddMemberModal() {
            //清除上一次的操作痕迹
            self.searchCondition = "";
            self.foundMembers.splice(0, self.foundMembers.length);

            memberAddModal.modal({backdrop: 'static', keyboard: false});
        }

        /**
         * 移除显示在模态框中的项目成员
         * @private
         */
        function _rmShowedMember(member) {
            rmShowedMemberClickCount++;
            if (rmShowedMemberClickCount % 2 === 0) {
                self.descriptionForRmBtn = '再次点击确认移除';
            } else if (rmShowedMemberClickCount % 2 === 1) {
                self.descriptionForRmBtn = '从项目组移除';
            }

            if (rmShowedMemberClickCount % 2 === 1) {
                ProjectInfoServices.rmMemberToProject(projectID, member, function (res) {
                    //成功了需要从 成员列表中移除
                    var index = self.thisProject.members.indexOf(member);
                    self.thisProject.members.splice(index, 1);
                    //关闭 模态框
                    memberStatusModal.modal('hide');
                }, function (res) {
                    //失败了 最好有个提示
                    alert('Faild');
                });
            }
        }

        /**
         * 设置显示在模态框中的项目成员的权限
         * @param {Object} member 成员
         * @param {String} member.account
         * @param {String} member.name
         * @param {String} authority 权限 "reviewer" or "normal"
         * @private
         */
        function _setShowedMemberAuthority(authority, member) {
            ProjectInfoServices.setProjectMemberAuthority(projectID, authority, member, function (res) {
                if (authority === 'reviewer') {
                    self.showedMember.isReviewer = true;
                } else if (authority === 'normal') {
                    self.showedMember.isReviewer = false;
                }
                //关闭 模态框
                memberStatusModal.modal('hide');
            }, function (res) {

            });
        }

        /**
         * 显示项目组成员的信息
         * @param {Object} member
         * @private
         */
        function _showMemberStatus(member) {
            /*for (var p in member) {
             self.showedMember[p] = member[p];
             }*/
            self.showedMember = member;
            memberStatusModal.modal({backdrop: 'static', keyboard: false});
        }

        /**
         * 取消对项目信息的修改
         * @private
         */
        function _cancelProjectInfo() {
            self.thisProjectInfo.cnName = self.thisProject.cnName;
            self.thisProjectInfo.enName = self.thisProject.enName;
            self.thisProjectInfo.type = self.thisProject.type;
            self.thisProjectInfo.about = self.thisProject.about;
            editProjectInfo.collapse('hide');
        }

        /**
         * 提交对项目信息的修改
         * @private
         */
        function _submitProjectInfo() {
            self.thisProject.cnName = self.thisProjectInfo.cnName;
            self.thisProject.enName = self.thisProjectInfo.enName;
            self.thisProject.type = self.thisProjectInfo.type;
            self.thisProject.about = self.thisProjectInfo.about;
            //TODO: 向服务器提交修改内容


        }

        /**
         * 显示、隐藏菜单栏
         * @param {Boolean} flg
         * @private
         */
        function _showMenu(flg) {
            self.isShowMenu = flg;
        }

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
         * 初始化函数
         */
        function _init() {

            memberNav.affix({
                offset: {
                    top: 500
                }
            });

            //TODO: 从url中截取 projectid 继而获取整个项目的属性
            projectID = $location.search().projectid;

            //从cookies中读取mystar
            myStar = $cookies.getObject('mystar-project');

            //从cookies中获取账号
            account = $cookies.get('account');

            //判断该项目是否为加星项目
            self.isStarred = _checkIsStarred(projectID);

            //获取整个项目的基本属性 （projectSchema）
            ProjectInfoServices.getProjectBaseInfo(projectID, function (res) {
                if (res.data !== null && res.data !== undefined && res.data.length > 0) {
                    var doc = res.data[0];
                    for (var p in doc) {
                        self.thisProject[p] = doc[p];
                    }
                    self.thisProjectInfo.cnName = self.thisProject.cnName;
                    self.thisProjectInfo.enName = self.thisProject.enName;
                    self.thisProjectInfo.type = self.thisProject.type;
                    self.thisProjectInfo.about = self.thisProject.about;
                    for (var i = 0; i < self.thisProject.members.length; i++) {
                        for (var j = 0; j < self.thisProject.reviewers.length; j++) {
                            if (self.thisProject.members[i].account === self.thisProject.reviewers[j].account) {
                                self.thisProject.members[i].isReviewer = true;
                            }
                        }
                    }

                    /**
                     * 判断是否为项目经理 (创建者为项目经理)
                     * @description 暂时以这种方式进行判断 前提是项目必须由项目经理本人创建
                     * 并且 中心负责人 默认为任何项目的项目经理
                     */
                    self.iamManager = _getIsManager(self.thisProject.authorID);
                    /*if (account === self.thisProject.authorID) {
                     self.iamManager = true;
                     } */

                    /**
                     * 修改页标题 = 项目中文名
                     */
                    document.title = self.thisProject.cnName;
                }
            }, function (err) {

            });

            /**
             * @description 获取项目的统计信息 默认只查当前月与上个月的统计
             */

                //生成标题
            var startDate = moment(new Date()).add(-1, 'M').startOf('month');
            var endDate = moment(new Date()).endOf('month');
            //初始化日期选择框
            self.monthRange.startDate = startDate;
            self.monthRange.endDate = endDate;
            ProjectInfoServices.getProjectStaticInfo({
                'project': projectID,
                'start': startDate.format('YYYY-MM-DD'),
                'end': endDate.format('YYYY-MM-DD')
            }, function (res) {
                if (res.error) {
                    alert(res.error);
                }
                //按项目组成员进行统计
                // _projectStaticByMember(res.doc, function (err, data) {
                //     //根据计算后的结果生成图表
                //     _createBarByResult(data);
                //     _createPieByResult(data);
                // });
                _createBarByResult(res.doc);
                _createPieByResult(res.doc)
            }, function (res) {

            });

            /**
             * @description 获取项目组成员的工作记录
             * 根据条件首次获取定量的条目             *
             */
            self.pageNum = 0;
            var skipNum = self.pageNum * MAXNUMPREPAGE;
            var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
            var startDate = self.monthRange.startDate.format("YYYY-MM-DD");
            var endDate = self.monthRange.endDate.format("YYYY-MM-DD");
            self.startDate = startDate;
            self.endDate = endDate;
            _getMemberJobLogs("all", startDate, endDate, skipNum, limitNum);
        }

        /**
         * @description 获取项目组成员的工作记录
         * @param {string} memberAccount
         * @param {string} startDate
         * @param {string} endDate
         * @param {Number} skipNum
         * @param {Number} limitNum
         * @private
         */
        function _getMemberJobLogs(memberAccount, startDate, endDate, skipNum, limitNum) {
            var accounts = [];
            if (memberAccount !== "all") {
                accounts.push(memberAccount);
            }
            ProjectInfoServices.getJobLogs(accounts, projectID, startDate, endDate, skipNum, limitNum, function (res) {
                var doc = res.doc;
                var count = 0;
                doc.forEach(function (item) {
                    item.showTime = moment(item.reportTime).format('MM月DD日 YYYY HH:mm');
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

        /**
         * 根据所选日期范围查询统计结果
         * @private
         */
        function _selectMonthRange() {

            ProjectInfoServices.getProjectStaticInfo({
                'project': projectID,
                'start': self.monthRange.startDate.format('YYYY-MM-DD'),
                'end': self.monthRange.endDate.format('YYYY-MM-DD')
            }, function (res) {
                if (res.error) {
                    alert(res.error);
                }
                _createBarByResult(res.doc);
                _createPieByResult(res.doc);
                //按项目组成员进行统计
                // _projectStaticByMember(res.doc, function (err, data) {
                //     //根据计算后的结果生成图表
                //     _createBarByResult(data);
                //     _createPieByResult(data);
                // });
            }, function (res) {

            });

            /**
             * @description 获取项目组成员的工作记录
             * 根据条件首次获取定量的条目             *
             */
            self.pageNum = 0;
            var skipNum = self.pageNum * MAXNUMPREPAGE;
            var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
            var startDate = self.monthRange.startDate.format("YYYY-MM-DD");
            var endDate = self.monthRange.endDate.format("YYYY-MM-DD");
            self.startDate = startDate;
            self.endDate = endDate;
            self.jobLogs.splice(0, self.jobLogs.length);
            _getMemberJobLogs(self.selectedMemberAccount, startDate, endDate, skipNum, limitNum);
        }

        /**
         * 根据计算后的结果生成饼状图
         *
         * @param {Array} data
         */
        function _createPieByResult(data) {
            var labels = [];
            var duration_Checked_List = [];
            var colors = ["#4F81BD", "#C0504D", "#9BBB59", "#8064A2", "#4BACC6", "#F79646"];
            var bgColorList = [];
            var total = 0;

            if (data === undefined || data.length < 1) {
                total = 100;
                labels.push('无数据');
                duration_Checked_List.push(100);
                bgColorList.push("#444");
            }

            for (var j = 0; j < data.length; j++) {
                if (self.iamManager) {
                    total += data[j].checked;
                } else {
                    total += data[j].real;
                }
            }
            for (var i = 0; i < data.length; i++) {
                labels.push(data[i].name);
                if (self.iamManager) {
                    duration_Checked_List.push((data[i].checked / total * 100).toFixed(0));
                } else {
                    duration_Checked_List.push((data[i].real / total * 100).toFixed(0));
                }
                bgColorList.push(colors[i % 6]);
            }
            var myData = {
                datasets: [{
                    data: duration_Checked_List,
                    backgroundColor: bgColorList
                }],
                labels: labels
            };
            var config = {
                type: 'pie',
                data: myData,
                options: {
                    responsive: true,

                }
            };

            if (self.myPie === undefined) {
                self.myPie = new Chart(ctxByMember_Pie, config);
            } else {
                self.myPie.destroy();
                self.myPie = new Chart(ctxByMember_Pie, config);
            }
        }

        /**
         * 根据计算后的结果生成柱状图
         *
         * @param {Array} data
         */
        function _createBarByResult(data) {
            var x_Labels = [];
            var duration_Checked_List = [];
            var duration_Real_List = [];
            var config = {};

            if (data === undefined || data.length < 1) {
                self.thisProject.members.forEach(function (member) {
                    x_Labels.push(member.name);
                    duration_Checked_List.push(0);
                    duration_Real_List.push(0);
                });
            } else {
                for (var i = 0; i < data.length; i++) {
                    x_Labels.push(data[i].name);
                    duration_Checked_List.push(data[i].checked.toFixed(2));
                    duration_Real_List.push(data[i].real.toFixed(2));
                }

            }

            var duration_Real_Dataset = {
                label: "实际",
                data: duration_Real_List,
                borderColor: 'rgba(81, 184, 242, 0.7)',
                backgroundColor: 'rgba(81, 184, 242, 0.5)'
            };

            var duration_Checked_Dateset = {
                label: "标准",
                data: duration_Checked_List,
                borderColor: 'rgba(52, 201, 169, 0.7)',
                backgroundColor: 'rgba(52, 201, 169, 0.5)'
            };

            var datasets = [];

            if (self.iamManager) {
                datasets.push(duration_Real_Dataset);
                datasets.push(duration_Checked_Dateset);
            } else {
                datasets.push(duration_Real_Dataset);
            }

            var myData = {
                labels: x_Labels,
                datasets: datasets
            };

            config = {
                type: 'bar',
                data: myData,
                options: {
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                //labelString: title
                            }
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
                self.myBar = new Chart(ctxByMember_Bar, config);
            } else {
                self.myBar.destroy();
                self.myBar = new Chart(ctxByMember_Bar, config);
            }
        }

        /**
         * 将传入的数据按项目组成员进行统计
         * @param {Array} data
         * @param {Function} cb
         * @param {Error} cb.err
         * @param {Object} cb.data
         */
        function _projectStaticByMember(data, cb) {
            var memberList = [];
            for (var i = 0; i < data.length; i++) {
                var staticItem = data[i];
                for (var j = 0; j < staticItem.staticByMember.length; j++) {
                    var member = staticItem.staticByMember[j];
                    var existFlg = false;
                    for (var k = 0; k < memberList.length; k++) {
                        if (memberList[k].account === member.account) {
                            memberList[k].duration_Checked += member.duration_Checked;
                            memberList[k].duration_Real += member.duration_Real;
                            existFlg = true;
                            break;
                        }
                    }
                    if (!existFlg) {
                        memberList.push(member);
                    }
                }
            }
            cb(null, memberList);
        }

        /**
         * 判断项目是否应该加星
         * @param {String} projectID
         * @returns
         */
        function _checkIsStarred(projectID) {
            var stars = $cookies.getObject('mystar-project');
            var result = false;
            if (stars === null || stars === undefined) return false;
            for (var i = 0; i < stars.length; i++) {
                if (stars[i] === projectID) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        /**
         *
         */
        function _starred() {
            self.isStarred = !self.isStarred;
            if (self.isStarred === true) {
                //cookies 对应修改状态
                myStar.push(projectID);
            } else {
                //cookies 对应修改状态
                var index = -1;
                for (var i = 0; i < myStar.length; i++) {
                    if (myStar[i] === projectID) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    myStar.splice(index, 1);
                }
            }
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7000);
            $cookies.putObject('mystar-project', myStar, {'expires': expireTime});
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
            }
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
                self.jobLogs.splice(0, self.jobLogs.length);
                self.pageNum = 0;
                var skipNum = self.pageNum * MAXNUMPREPAGE;
                var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
                _getMemberJobLogs(self.selectedMemberAccount, self.startDate, self.endDate, skipNum, limitNum);
            }
        }

        function _showMoreActivity() {
            var skipNum = self.pageNum * MAXNUMPREPAGE;
            var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
            _getMemberJobLogs(self.selectedMemberAccount, self.startDate, self.endDate, skipNum, limitNum);
        }

        function _isShowArea(item) {
            return self.profileNavCurrentItem === item;
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
         * 判断是否为项目经理 (创建者为项目经理)
         * @description 暂时以这种方式进行判断 前提是项目必须由项目经理本人创建 并且 中心负责人 默认为任何项目的项目经理
         * @param {string} authorID
         * @private
         */
        function _getIsManager(authorID) {
            var isManager = false;
            var sysconfig = $cookies.getObject('Sysconfig');
            sysconfig[0].departmentGroups.forEach(function (departmentGroup) {
                for (var i = 0; i < departmentGroup.manager.length; i++) {
                    var manager = departmentGroup.manager[i];
                    if (manager.account === account) {
                        isManager = true;
                        break;
                    }
                }
            });
            return isManager || (account === authorID);
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
            self.currentJob.isReviewer = self.iamManager;
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
    }

})();