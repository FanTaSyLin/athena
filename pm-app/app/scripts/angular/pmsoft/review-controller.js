/**
 * Created by FanTaSyLin on 2016/9/14.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('ReviewController', ReviewController);

    ReviewController.$inject = ['PMSoftServices', '$cookies'];

    function ReviewController(PMSoftServices, $cookies) {

        var self = this;
        var myNav = angular.element(document.getElementById('myNav'));
        self.pageSize = 40;
        self.unauditedJobs_Container = [];
        self.unauditedJobs_View = [];
        self.projects = [];
        self.members = [];
        self.paginations = [];
        self.selectedProjectEName = 'all';
        self.selectedMemberAccount = 'all';
        self.unauditedJobsCount = 0;
        self.isSelectedProject = isSelectedProject;
        self.projectSelect = projectSelect;
        self.isSelectedMember = isSelectedMember;
        self.memberSelect = memberSelect;
        self.init = init;
        self.isShowPagination = false;

        function init() {

            myNav.affix({
                offset: {
                    top: 125
                }
            });

            self.account = $cookies.get('username');

            PMSoftServices.getPastProjects(self.account, function (data) {

                //TODO: 目前只添加了需要的字段，后续如果不够吃再加
                self.projects = [];
                data.forEach(function (item) {
                    var project = {};
                    project.cnName = item.cnName;
                    project._id = item._id;
                    project.enName = item.enName;
                    project.reviewers = item.reviewers;
                    self.projects.push(project);
                });

                //获取未审核工作记录
                _getUnauditedJobs({
                    projectList: self.projects,
                    memberID: null
                }, function (data) {
                    //统计各个项目未审核工作的数量
                    _unauditedJobsStatics();
                    //获取项目成员列表
                    _getMemberList(self.unauditedJobs_Container);
                    //生成分页标签
                    _getPagination(data);
                    //获取分页数据
                    _viewUnauditedJobs(self.unauditedJobs_Container, 1, self.pageSize);
                });

            }, function (res) {

            });
        }

        function memberSelect(memberAccount) {
            self.selectedMemberAccount = memberAccount;
            var count = filterUnauditedJobs(self.selectedProjectEName, memberAccount, 1, self.pageSize);
            _getPagination(count);
        }

        function isSelectedMember(memberAccount) {
            return self.selectedMemberAccount == memberAccount;
        }

        function projectSelect(projectEName) {
            self.selectedProjectEName = projectEName;
            var count = filterUnauditedJobs(projectEName, 'all', 1, self.pageSize);
            self.selectedMemberAccount = 'all'; //每次选择完项目后 由于人员列表的刷新 所以必须置成 all
            _getPagination(count);
        }

        function isSelectedProject(projectEName) {
            return self.selectedProjectEName == projectEName
        }

        /**
         * 获取未审核的工作记录
         */
        function _getUnauditedJobs(condition, cb) {
            PMSoftServices.getUnauditedJobs(condition, function (data) {
                var doc = data.doc;
                doc.forEach(function (item) {
                    item.thumb = _extractImg(item.content);
                    item.cleanContent = _delHtmlTag(item.content);
                    self.unauditedJobs_Container.push(item);
                });
                cb(data.count);
            }, function (res) {

            });
        }

        /**
         * 统计各个项目未审核工作的数量
         */
        function _unauditedJobsStatics() {
            self.projects.forEach(function (item) {
                var count = 0;
                for (var i = 0; i < self.unauditedJobs_Container.length; i++) {
                    if (self.unauditedJobs_Container[i].projectEName === item.enName) {
                        count++;
                    }
                }
                item.count = count;
            });
        }

        /**
         * 获取项目成员列表
         * @private
         */
        function _getMemberList(jobList) {
            self.members = [];
            jobList.forEach(function (item) {
                if (!_isInclude(item.authorID)) {
                    self.members.push({
                        name: item.authorName,
                        account: item.authorID
                    });
                }
            });

            function _isInclude(obj) {
                for (var i = 0; i < self.members.length; i++) {
                    if (self.members[i].account === obj) {
                        return true
                    }
                }
                return false;
            }
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
            if(tmpStr.length > 130) {
                tmpStr = tmpStr.substring(0, 130) + '...';
            }
            return tmpStr;
        }

        /**
         * 提取字符串中的 Data URL 数据
         * @param str
         * @returns {*}
         * @private
         */
        function _extractImg(str) {
            var rex =  /<img.*?src=(?:"|')?([^ "']*)/ig;
            var res = rex.exec(str);
            if (res && res.length > 0) {
                return res[1];
            } else {
                return '';
            }
        }

        /**
         * 获取页面的分页标签
         * @param count
         * @private
         */
        function _getPagination(count) {
            var pageCount = Math.ceil(count/self.pageSize);
            self.paginations = [];
            for (var i = 1; i <= pageCount; i++) {
                self.paginations.push({
                    num: i
                });
            }
            if (count > self.pageSize) {
                self.isShowPagination = true;
            } else {
                self.isShowPagination = false;
            }
        }

        /**
         * 获取显示用数据集
         * @param jobList
         * @param pageNum
         * @param pageSize
         * @private
         */
        function _viewUnauditedJobs(jobList, pageNum, pageSize) {
            self.unauditedJobs_View = [];
            for (var i = 0; i < jobList.length; i++) {
                if (i >= (pageNum - 1) * pageSize  && i < pageNum * pageSize) {
                    self.unauditedJobs_View.push(jobList[i]);
                }
            }
        }

        /**
         * 数据筛选
         * @param projectEName
         * @param memberID
         */
        function filterUnauditedJobs(projectEName, memberID, pageNum, pageSize) {
            self.unauditedJobs_View = [];
            var count = 0;
            var tmpList = [];
            self.unauditedJobs_Container.forEach(function (item) {
                if (projectEName == 'all') {
                    if (memberID === 'all') {
                        count++;
                        if (count >= (pageNum - 1) * pageSize && count < pageNum * pageSize) {
                            self.unauditedJobs_View.push(item);
                        }
                        tmpList.push(item);
                    } else {
                        if (memberID === item.authorID) {
                            count++;
                            if (count >= (pageNum - 1) * pageSize && count < pageNum * pageSize) {
                                self.unauditedJobs_View.push(item);
                            }
                            tmpList.push(item);
                        } else {
                            tmpList.push(item);
                        }
                    }
                } else {
                    if (item.projectEName === projectEName) {
                        //alert('1');
                        if (memberID === 'all') {
                            count++;
                            if (count >= (pageNum - 1) * pageSize && count < pageNum * pageSize) {
                                self.unauditedJobs_View.push(item);
                            }
                            tmpList.push(item);
                        } else {
                            if (memberID === item.authorID) {
                                count++;
                                if (count >= (pageNum - 1) * pageSize && count < pageNum * pageSize) {
                                    self.unauditedJobs_View.push(item);
                                }
                                tmpList.push(item);
                            } else {
                                tmpList.push(item);
                            }
                        }
                    }
                }
            });
            _getMemberList(tmpList);
            return count;
        }
    }

})();