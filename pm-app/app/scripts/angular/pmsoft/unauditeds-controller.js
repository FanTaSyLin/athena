/**
 * Created by FanTaSyLin on 2016/9/14.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('UnauditedListController', UnauditedListController);

    UnauditedListController.$inject = ['PMSoftServices', '$cookies'];

    function UnauditedListController(PMSoftServices, $cookies) {

        var self = this;
        var myNav = angular.element(document.getElementById('myNav'));
        var jobAudited = angular.element(document.getElementById('JobAudited'));
        self.pageSize = 40;
        self.unauditedJobs_View = PMSoftServices.unauditedJobList_View;
        self.unauditedJobs_Total = PMSoftServices.unauditedJobList_Total;
        self.projects = [];
        self.members = [];
        self.paginations = [];
        self.selectedProjectEName = 'all';
        self.selectedMemberAccount = 'all';
        self.unauditedJobsCount = 0;
        self.isShowPagination = false;
        self.currentJob = {};
        self.isSelectedProject = isSelectedProject;
        self.projectSelect = projectSelect;
        self.isSelectedMember = isSelectedMember;
        self.memberSelect = memberSelect;
        self.init = init;
        self.showJobInfo = showJobInfo;
        self.timeFormat = _timeFormat;
        self.subStr = _subStr;

        function init() {

            myNav.affix({
                offset: {
                    top: 125
                }
            });

            self.account = $cookies.get('account');

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
                }, function (err, dataCount) {
                    if (err) {
                        return;
                    }
                    //统计各个项目未审核工作的数量
                    _unauditedJobsStatics();
                    //获取项目成员列表
                    _getMemberList(PMSoftServices.unauditedJobList_Total);
                    //生成分页标签
                    _getPagination(dataCount);
                    //根据选项筛选数据
                    _filterUnauditedJobs('all', 'all');
                    //获取分页数据
                    _viewUnauditedJobs(1, self.pageSize);
                });

            }, function (res) {

            });
        }

        function memberSelect(memberAccount) {
            self.selectedMemberAccount = memberAccount;
            _filterUnauditedJobs(self.selectedProjectEName, memberAccount);
            _viewUnauditedJobs(1, self.pageSize);
            _getPagination(PMSoftServices.unauditedJobList_Filter.length);
        }

        function isSelectedMember(memberAccount) {
            return self.selectedMemberAccount == memberAccount;
        }

        function projectSelect(projectEName) {
            self.selectedProjectEName = projectEName;
            _filterUnauditedJobs(projectEName, 'all');
            _viewUnauditedJobs(1, self.pageSize);
            _getPagination(PMSoftServices.unauditedJobList_Filter.length);
            self.selectedMemberAccount = 'all'; //每次选择完项目后 由于人员列表的刷新 所以必须置成 all
        }

        function isSelectedProject(projectEName) {
            return self.selectedProjectEName == projectEName;
        }

        /**
         * 获取未审核的工作记录, 并将其记录在PMSoftServices.unauditedJobList_Total中
         */
        function _getUnauditedJobs(condition, cb) {
            PMSoftServices.getUnauditedJobs(condition, function (data) {
                var doc = data.doc;
                PMSoftServices.cleanUnauditedJobList_Total();
                doc.forEach(function (item) {
                    item.thumb = _extractImg(item.content);
                    item.cleanContent = _delHtmlTag(item.content);
                    item.starTime = new Date(new Date(item.starTime.substring(0, 10) + ' ' + item.starTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000);
                    item.endTime = new Date(new Date(item.endTime.substring(0, 10) + ' ' + item.endTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000);
                    PMSoftServices.unauditedJobList_Total.push(item);
                });
                cb(null, data.count);
            }, function (res) {
                cb(new Error(), 0);
            });
        }

        /**
         * 统计各个项目未审核工作的数量
         */
        function _unauditedJobsStatics() {
            self.projects.forEach(function (item) {
                var count = 0;
                for (var i = 0; i < PMSoftServices.unauditedJobList_Total.length; i++) {
                    if (PMSoftServices.unauditedJobList_Total[i].projectEName === item.enName) {
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
                        return true;
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
        function _viewUnauditedJobs(pageNum, pageSize) {
            //清空原数组
            PMSoftServices.unauditedJobList_View.splice(0,PMSoftServices.unauditedJobList_View.length);

            for (var i = 0; i <  PMSoftServices.unauditedJobList_Filter.length; i++) {
                if (i >= (pageNum - 1) * pageSize  && i < pageNum * pageSize) {
                    self.unauditedJobs_View.push(PMSoftServices.unauditedJobList_Filter[i]);
                }
            }
        }

        /**
         * 显示工作日志
         * @param jobModule
         */
        function showJobInfo(jobModule) {
            PMSoftServices.changeCurrentUnauditedJob(jobModule);
            //jobAudited.modal('show');
            jobAudited.modal({backdrop: 'static', keyboard: false});
        }

        /**
         * 数据筛选
         * @param projectEName 条件参数-1
         * @param memberID 条件参数-2
         * @private
         */
        function _filterUnauditedJobs(projectEName, memberID) {

            var tmpList = [];

            //清空原数组
            PMSoftServices.unauditedJobList_Filter.splice(0,PMSoftServices.unauditedJobList_Filter.length);

            PMSoftServices.unauditedJobList_Total.forEach(function (item) {
                if (projectEName === 'all') {
                     if (memberID === 'all') {
                         PMSoftServices.unauditedJobList_Filter.push(item);
                         tmpList.push(item);
                     } else {
                         if (memberID === item.authorID) {
                             PMSoftServices.unauditedJobList_Filter.push(item);
                             tmpList.push(item);
                         } else {
                             tmpList.push(item);
                         }
                     }
                } else {
                    if (projectEName === item.projectEName) {
                        if (memberID === 'all') {
                            PMSoftServices.unauditedJobList_Filter.push(item);
                            tmpList.push(item);
                        } else {
                            if (memberID === item.authorID) {
                                PMSoftServices.unauditedJobList_Filter.push(item);
                                tmpList.push(item);
                            } else {
                                tmpList.push(item);
                            }
                        }
                    }
                }
                _getMemberList(tmpList);
                return PMSoftServices.unauditedJobList_Filter.length;
            });

        }

        /**
         * 时间格式化
         * @param time
         * @returns {string}
         * @private
         */
        function _timeFormat(time) {

            return ((time.getHours() < 10) ? '0' + time.getHours() : time.getHours())
                + ':' +
                ((time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes());

        }

        function _subStr(str, count) {
            return str.substring(0, count);
        }
    }

})();