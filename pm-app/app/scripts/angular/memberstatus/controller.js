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
        var projectNav = angular.element(document.getElementById('projectNav'));

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

        function _initData() {

            account = _getQueryString("memberid");

            projectNav.affix({
                offset: {
                    top: 600
                }
            });

            if (account === cookiesAccount) {
                self.isIam = true;
            }

            /**
             * 获取成员的详细信息
             */
            MemberStatusServices.getMemberInfo(account, function (res) {

                var doc = res;
                var member = (doc.length > 0) ? doc[0] : null;
                for(var p in member) {
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

        }

        /**
         * @description 获取地址栏参数
         * @param {string} paramName
         * @return {string|null} paramValue
         * @private
         */
        function _getQueryString(paramName) {
            var reg = new RegExp("(^|&)"+ paramName +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return  unescape(r[2]); return null;
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
                                self.projectList[j].totalWorkDone = data[i].totalWorkDone;var precent = 0 ;
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
         * @param memberAccount
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
            _getProjectJobLogs(self.selectedMemberAccount, skipNum, limitNum);
        }

        function _openThisProject(projectID) {
            var url = 'projectinfo?projectid=' + projectID;
            window.open(url);
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