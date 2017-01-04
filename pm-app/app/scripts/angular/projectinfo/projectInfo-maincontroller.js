/**
 * Created by FanTaSyLin on 2016/11/4.
 */

(function () {

    'use strict';

    angular.module('ProjectInfo')
        .controller('ProjectInfo-MainController', MainControllerFn);

    MainControllerFn.$inject = ['$location', '$cookies', 'ProjectInfoServices'];


    function MainControllerFn($location, $cookies, ProjectInfoServices) {
        var self = this;
        var myStar = [];
        var projectID = '';
        var account = '';
        var rmShowedMemberClickCount = 1; //用来记录移除成员时的点击次数
        var ctxByMember_Bar = angular.element(document.getElementById('Chart-ByMember-bar'));
        var ctxByMember_Pie = angular.element(document.getElementById('Chart-ByMember-pie'));
        var dateSelectArea = angular.element(document.getElementById('dateSelectArea'));
        var editProjectInfo = angular.element(document.getElementById('edit-project-info'));
        var memberStatusModal = angular.element(document.getElementById('member-status-modal'));
        var memberAddModal = angular.element(document.getElementById('member-add-modal'));

        self.isStarred = false;
        self.thisProject = {};
        self.thisProjectInfo = {};
        self.title = '';
        self.monthRange = {
            startYear: '',
            startMonth: '',
            endYear: '',
            endMonth: ''
        };
        self.isShowMenu = false;
        self.showedMember = {};
        self.descriptionForRmBtn = '从项目组移除';
        self.iamManager = false;
        self.searchCondition = '';
        self.foundMembers = [];

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

        //当 collapse 隐藏时 触发查询
        dateSelectArea.on('hidden.bs.collapse', function () {
            _selectMonthRange();
        });


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

            memberAddModal.modal({ backdrop: 'static', keyboard: false });
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
            memberStatusModal.modal({ backdrop: 'static', keyboard: false });
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
            var year = Number(self.monthRange.startYear);
            self.monthRange.startYear = (year + 1).toString();
        }

        function _startYearSubstract() {
            var year = Number(self.monthRange.startYear);
            self.monthRange.startYear = (year - 1).toString();
        }

        function _startMonthAdd() {
            var month = Number(self.monthRange.startMonth);
            if (month < 12) {
                month = month + 1;
            }
            self.monthRange.startMonth = (month.toString().length < 2) ? '0' + month.toString() : month.toString();
        }

        function _startMonthSubstract() {
            var month = Number(self.monthRange.startMonth);
            if (month > 1) {
                month = month - 1;
            }
            self.monthRange.startMonth = (month.toString().length < 2) ? '0' + month.toString() : month.toString();
        }

        function _endYearAdd() {
            var year = Number(self.monthRange.endYear);
            self.monthRange.endYear = (year + 1).toString();
        }

        function _endYearSubstract() {
            var year = Number(self.monthRange.endYear);
            self.monthRange.endYear = (year - 1).toString();
        }

        function _endMonthAdd() {
            var month = Number(self.monthRange.endMonth);
            if (month < 12) {
                month = month + 1;
            }
            self.monthRange.endMonth = (month.toString().length < 2) ? '0' + month.toString() : month.toString();
        }

        function _endMonthSubstract() {
            var month = Number(self.monthRange.endMonth);
            if (month > 1) {
                month = month - 1;
            }
            self.monthRange.endMonth = (month.toString().length < 2) ? '0' + month.toString() : month.toString();
        }


        /**
         * 初始化函数
         */
        function _init() {

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
                     */
                    if (account === self.thisProject.authorID) {
                        self.iamManager = true;
                    }

                    /**
                     * 修改页标题 = 项目中文名
                     */
                    document.title = self.thisProject.cnName;
                }
            }, function (err) {

            });

            //获取项目的统计信息
            //默认只查当前月与上个月的统计
            var now = new Date();
            var y1 = now.getFullYear();
            var m1 = now.getMonth() + 1;
            var y2 = (m1 === 1) ? (y1 - 1) : y1;
            var m2 = (m1 === 1) ? 12 : m1 - 1;
            m1 = (m1.toString().length < 2) ? '0' + m1.toString() : m1.toString();
            m2 = (m2.toString().length < 2) ? '0' + m2.toString() : m2.toString();
            var startMonth = y2.toString() + m2;
            var endMonth = y1.toString() + m1;
            ProjectInfoServices.getProjectStaticInfo({
                'projectID': projectID,
                'startMonth': startMonth,
                'endMonth': endMonth
            }, function (res) {
                if (res.error) {
                    alert(res.error);
                }

                //按项目组成员进行统计
                _projectStaticByMember(res.doc, function (err, data) {
                    //根据计算后的结果生成图表
                    _createBarByResult(data);
                    _createPieByResult(data);
                });

                //生成标题
                self.title = '统计范围 (' + startMonth.toString().substring(0, 4) + '年' + startMonth.toString().substring(4, 6) + '月 至 ' +
                    endMonth.toString().substring(0, 4) + '年' + endMonth.toString().substring(4, 6) + '月)';
                //初始化日期选择框
                self.monthRange.startYear = y2;
                self.monthRange.startMonth = m2;
                self.monthRange.endYear = y1;
                self.monthRange.endMonth = m1;

            }, function (res) {

            });
        }

        /**
         * 根据所选日期范围查询统计结果
         * @private
         */
        function _selectMonthRange() {

            var startMonth = self.monthRange.startYear + self.monthRange.startMonth;
            var endMonth = self.monthRange.endYear + self.monthRange.endMonth;

            ProjectInfoServices.getProjectStaticInfo({
                'projectID': projectID,
                'startMonth': startMonth,
                'endMonth': endMonth
            }, function (res) {
                if (res.error) {
                    alert(res.error);
                }

                //按项目组成员进行统计
                _projectStaticByMember(res.doc, function (err, data) {
                    //根据计算后的结果生成图表
                    _createBarByResult(data);
                    _createPieByResult(data);
                });

                //生成标题
                self.title = '统计范围 (' + startMonth.toString().substring(0, 4) + '年' + startMonth.toString().substring(4, 6) + '月 至 ' +
                    endMonth.toString().substring(0, 4) + '年' + endMonth.toString().substring(4, 6) + '月)';

            }, function (res) {

            });
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
                total += data[j].duration_Checked;
            }
            for (var i = 0; i < data.length; i++) {
                labels.push(data[i].name);
                duration_Checked_List.push((data[i].duration_Checked / total * 100).toFixed(0));
                bgColorList.push(colors[i % 6]);
            }
            var config = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: duration_Checked_List,
                        backgroundColor: bgColorList
                    }],
                    labels: labels
                },
                options: {
                    responsive: true,

                }
            };
            return new Chart(ctxByMember_Pie, config);
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
                    duration_Checked_List.push(data[i].duration_Checked.toFixed(2));
                    duration_Real_List.push(data[i].duration_Real.toFixed(2));
                }

            }

            config = {
                type: 'bar',
                data: {
                    labels: x_Labels,
                    datasets: [{
                        label: "实际",
                        data: duration_Real_List,
                        borderColor: 'rgba(81, 184, 242, 0.7)',
                        backgroundColor: 'rgba(81, 184, 242, 0.5)'
                    }, {
                        label: "标准",
                        data: duration_Checked_List,
                        borderColor: 'rgba(52, 201, 169, 0.7)',
                        backgroundColor: 'rgba(52, 201, 169, 0.5)'
                    }]
                },
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
            return new Chart(ctxByMember_Bar, config);
        }

        /**
         * 将传入的数据按项目组成员进行统计
         *
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
         *
         *
         * @param {String} projectID
         * @returns
         */
        function _checkIsStarred(projectID) {
            var stars = $cookies.getObject('mystar-project');
            var result = false;
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
            $cookies.putObject('mystar-project', myStar, { 'expires': expireTime });
        }
    }

})();
