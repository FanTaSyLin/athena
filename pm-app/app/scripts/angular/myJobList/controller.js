/**
 * Created by FanTaSyLin on 2016/10/12.
 */

(function () {

    'use strict';

    angular.module('MyJobs')
        .controller('MyJobsController', MyJobsControllerFn);

    MyJobsControllerFn.$inject = ['$cookies', 'MyJobsServices'];

    function MyJobsControllerFn($cookies, MyJobsServices) {

        var self = this;
        var account = '';
        var MAXNUMPREPAGE = 50;//一次获取的工作记录条目个数
        var myNav = angular.element(document.getElementById('myNav'));
        var JobInfo = angular.element(document.getElementById('JobInfo'));
        var mySummerNote = angular.element(document.getElementById('mySummerNote'));

        self.selectedProjectID = "turnBack";
        self.isShowShowMoreAcitivtyBtn = true;
        self.jobLogs = [];
        self.pageNum = 0;


        self.pageSize = 10;
        self.selectedProject = {enName: 'all'};

        /**
         * 参与的项目列表
         */
        self.projects = [];
        /**
         * 是否显示分页标签
         */
        self.isShowPagination = false;
        /**
         * 分页标签列表
         */
        self.paginations = [];
        /**
         * 工作记录列表
         */
        self.myJobList = [];
        /**
         * 当前页
         */
        self.currentPage = 1;
        /**
         * 最大页码
         */
        self.maxPage = 0;
        /**
         * 最小页码
         */
        self.minPage = 0;
        /**
         * 当前模态框中的显示对象
         */
        self.currentJobInfo = {
            selectedProject: {},
            selectedDate: new Date(),
            timeList: [],
            selectedStartTime: new Date(),
            selectedEndTime: new Date(),
            selectedJobType: '',
            content: '',
            jobModule: {},
            /*是否显示保存按钮*/
            isShowSaveBtn: false,
            /*是否显示编辑按钮*/
            isShowEditBtn: true,
            /*是否提交按钮可用*/
            enableSubmitBtn: false,
            /*已提交的工作列表  用来比对时间是否冲突*/
            recodedJobs: [],
            /*本条工作记录相关的操作日志*/
            logs: []
        };
        /**
         * 工作记录列表
         * @type {Array}
         */
        self.jobLogs = [];

        /**
         * 页面加载时初始化数据
         */
        self.init = _init;
        /**
         * 是否选中项目 判断
         */
        self.isSelectedProject = _isSelectedProject;
        /**
         * 选中项目 判断
         */
        self.projectSelect = _projectSelect;
        /**
         * 前翻页
         */
        self.pageBackward = _pageBackward;
        /**
         * 后翻页
         */
        self.pageForward = _pageForward;
        /**
         * 到指定页
         */
        self.pageGoTo = _pageGoTo;
        /**
         * 格式化时间
         */
        self.timeFormat = _timeFormat;
        /**
         * 格式化时间 + 日期 格式
         */
        self.formatDateTime = _formatDateTime;
        /**
         * 显示工作记录详情
         */
        self.showJobInfo = _showJobInfo;
        /**
         * 获取更多活动
         */
        self.showMoreActivity = _showMoreActivity;
        /**
         * 模态框选择函数
         */
        self.modalSTimeSelect = _modalSTimeSelect;
        self.modalETimeSelect = _modalETimeSelect;
        self.modalTypeSelect = _modalTypeSelect;
        self.modalProjectSelect = _modalProjectSelect;
        self.modalEditContent = _modalEditContent;
        self.modalSaveContent = _modalSaveContent;
        self.modalUpdateRecode = _modalUpdateRecode;

        self.getDateFormat = _getDateFormat;

        function _init() {

            //定位侧边栏
            myNav.affix({
                offset: {
                    top: 125
                }
            });

            //生成模态框的时间列表
            self.currentJobInfo.timeList = _getTimeList();

            account = $cookies.get('account');

            //获取项目列表
            MyJobsServices.getPastProjects(account, function (data) {
                self.projects.splice(0, self.projects.length);
                data.forEach(function (item) {
                    self.projects.push(item);
                });

                /**
                 * @description 获取项目组成员的工作记录
                 * 根据条件首次获取定量的条目             *
                 */
                self.pageNum = 0;
                var skipNum = self.pageNum * MAXNUMPREPAGE;
                var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
                _getProjectJobLogs(self.selectedProjectID, skipNum, limitNum);
            }, function (data) {

            });
        }

        function _getDateFormat(time) {
            return moment(time).format("YYYY年MM月DD日");
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
            if (projectID !== "turnBack") {
                MyJobsServices.getJobLogs(account, projectIDs, skipNum, limitNum, function (res) {
                    var doc = res.doc;
                    var count = 0;
                    doc.forEach(function (item) {
                        item.showTime = moment(item.reportTime).format('MM月DD日 YYYY HH:mm');
                        item.cleanContent = _delHtmlTag(item.content);
                        item.starTime = moment(item.starTime);
                        item.endTime = moment(item.endTime);
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
            } else {
                MyJobsServices.getJobLogs_TurnBack(account, [], skipNum, limitNum, function (res) {
                    var doc = res.doc;
                    var count = 0;
                    doc.forEach(function (item) {
                        item.showTime = moment(item.reportTime).format('MM月DD日 YYYY HH:mm');
                        item.starTime = moment(item.starTime);
                        item.endTime = moment(item.endTime);
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
        }

        function _showMoreActivity() {
            var skipNum = self.pageNum * MAXNUMPREPAGE;
            var limitNum = (self.pageNum + 1) * MAXNUMPREPAGE;
            _getProjectJobLogs(self.selectedProjectID, skipNum, limitNum);
        }

        function _isSelectedProject(projectID) {
            return self.selectedProjectID === projectID;
        }

        function _projectSelect(projectID) {
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

        function _modalSTimeSelect(timeObj) {
            self.currentJobInfo.selectedStartTime = timeObj.time;
        }

        function _modalETimeSelect(timeObj) {
            self.currentJobInfo.selectedEndTime = timeObj.time;
        }

        function _modalTypeSelect(type) {
            self.currentJobInfo.selectedJobType = type;
        }

        /*function _getJobListPagination(condition, cb) {
         MyJobsServices.getJobListPagination(condition, function (data) {
         cb(null, data.count);
         }, function (data) {
         cb(new Error(data), null);
         });
         }

         /!**
         * 获取页面的分页标签
         * @param count
         * @private
         *!/
         function _getPagination(count) {
         var pageCount = Math.ceil(count / self.pageSize);
         self.paginations = [];
         self.minPage = 1;
         self.maxPage = pageCount;
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

         /!**
         * 按分页获取工作记录
         * @param condition
         * @param cb
         * @private
         *!/
         function _getJobListByPage(condition, cb) {
         MyJobsServices.getJobListByPage(condition, function (data) {
         var doc = data.doc;
         self.myJobList.splice(0, self.myJobList.length);
         doc.forEach(function (item) {
         item.thumb = _extractImg(item.content);
         item.cleanContent = _delHtmlTag(item.content);
         item.starTime = new Date(new Date(item.starTime.substring(0, 10) + ' ' + item.starTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000);
         item.endTime = new Date(new Date(item.endTime.substring(0, 10) + ' ' + item.endTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000);
         self.myJobList.push(item);
         });
         cb(null);
         }, function (err) {
         cb(new Error(err));
         });
         }*/

        /**
         * 提取字符串中的 Data URL 数据
         * @param str
         * @returns {*}
         * @private
         */
        function _extractImg(str) {
            var rex = /<img.*?src=(?:"|')?([^ "']*)/ig;
            var res = rex.exec(str);
            if (res && res.length > 0) {
                return res[1];
            } else {
                return '';
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
            if (tmpStr.length > 130) {
                tmpStr = tmpStr.substring(0, 130) + '...';
            }
            return tmpStr;
        }

        /**
         * 向前翻页
         * @private
         */
        function _pageBackward() {
            if (self.currentPage > self.minPage) {
                self.currentPage--;
                var condition = {};
                condition.account = account;
                if (self.selectedProject.enName === 'all') {
                    condition.projectList = self.projects;
                } else {
                    condition.projectList = [self.selectedProject];
                }
                condition.startNum = (self.currentPage - 1) * self.pageSize + 1;
                condition.pageSize = self.pageSize;
                _getJobListByPage(condition, function (err) {

                });
            }
        }

        /**
         * 向后翻页
         * @private
         */
        function _pageForward() {
            if (self.currentPage < self.maxPage) {
                self.currentPage++;
                var condition = {};
                condition.account = account;
                if (self.selectedProject.enName === 'all') {
                    condition.projectList = self.projects;
                } else {
                    condition.projectList = [self.selectedProject];
                }
                condition.startNum = (self.currentPage - 1) * self.pageSize + 1;
                condition.pageSize = self.pageSize;
                _getJobListByPage(condition, function (err) {

                });
            }
        }

        /**
         * 到指定页
         * @param num
         * @private
         */
        function _pageGoTo(num) {
            self.currentPage = num;
            var condition = {};
            condition.account = account;
            if (self.selectedProject.enName === 'all') {
                condition.projectList = self.projects;
            } else {
                condition.projectList = [self.selectedProject];
            }
            condition.startNum = (num - 1) * self.pageSize + 1;
            condition.pageSize = self.pageSize;
            _getJobListByPage(condition, function (err) {

            });
        }

        /**
         * 时间格式化
         * @param time
         * @returns {string}
         * @private
         */
        function _timeFormat(time) {

            if (time === undefined) return "";

            return moment(time).format("HH:mm");

            /*return ((time.getHours() < 10) ? '0' + time.getHours() : time.getHours())
             + ':' +
             ((time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes());
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
         * 显示工作记录详情
         * @param {Object} jobModule 工作记录对象
         * @private
         */
        function _showJobInfo(jobModule) {
            self.projects.forEach(function (item) {
                if (item._id === jobModule.projectID) {
                    self.currentJobInfo.selectedProject = item;
                }
            });
            self.currentJobInfo.selectedDate = jobModule.starTime;
            self.currentJobInfo.selectedStartTime = jobModule.starTime;
            self.currentJobInfo.selectedEndTime = jobModule.endTime;
            self.currentJobInfo.selectedJobType = jobModule.type;
            self.currentJobInfo.content = jobModule.content;
            self.currentJobInfo.logs = jobModule.logs.sort(function (a, b) {
                var x = new Date(a.logTime).getTime();
                var y = new Date(b.logTime).getTime();
                return y - x;
            });
            self.currentJobInfo.jobModule = jobModule;
            if (jobModule.status === 'TurnBack') {
                self.currentJobInfo.isShowEditBtn = true;
                self.currentJobInfo.enableSubmitBtn = true;
            } else {
                self.currentJobInfo.isShowEditBtn = false
                self.currentJobInfo.enableSubmitBtn = false;
            }
            self.currentJobInfo.isShowSaveBtn = false;
            JobInfo.modal({backdrop: 'static', keyboard: false});
            if (jobModule.status === 'TurnBack') {
                var condition = {
                    username: account,
                    startDate: moment(self.currentJobInfo.selectedDate).format("YYYY-MM-DD"),//new Date(self.currentJobInfo.selectedDate.getTime() + 8 * 60 * 60 * 1000).toISOString().substring(0, 10),
                    endDate: moment(self.currentJobInfo.selectedDate).format("YYYY-MM-DD")//new Date(self.currentJobInfo.selectedDate.getTime() + 8 * 60 * 60 * 1000).toISOString().substring(0, 10)
                };
                MyJobsServices.getJobList(condition, function (data) {
                    var result = data.doc;
                    self.currentJobInfo.recodedJobs.splice(0, self.currentJobInfo.recodedJobs.length);
                    try {

                        for (var i = 0; i < result.length; i++) {
                            var item = result[i];
                            if (item._id !== self.currentJobInfo.jobModule._id) {
                                self.currentJobInfo.recodedJobs.push({
                                    startTime: moment(item.starTime),//new Date(new Date(item.starTime.substring(0, 10) + ' ' + item.starTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000),
                                    endTime: moment(item.endTime),//new Date(new Date(item.endTime.substring(0, 10) + ' ' + item.endTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000),
                                    cnName: item.projectCName,
                                    enName: item.projectEName,
                                    reportTime: moment(item.reportTime)//new Date(new Date(item.reportTime.substring(0, 10) + ' ' + item.reportTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000)
                                });
                            }
                        }

                    } catch (err) {
                        alert(err);
                    }
                }, function (data) {

                });
            }
        }

        /**
         * 获取时间列表
         * @private
         */
        function _getTimeList() {

            var startDate = new Date('2016-01-01 07:00:00');
            var timeList = [];
            for (var i = 0; i < 48; i++) {
                var time = new Date(startDate.getTime() + i * 0.5 * 60 * 60 * 1000);
                timeList.push({
                    str: _timeFormat(time),
                    time: time
                });
            }
            return timeList;
        }

        /**
         * 模态框中的项目选择函数
         * @private
         */
        function _modalProjectSelect(project) {
            self.currentJobInfo.selectedProject = project;
        }

        /**
         * 点击编辑模态框中的内容
         * @private
         */
        function _modalEditContent() {
            mySummerNote.summernote({
                minHeight: 200,
                maxHeight: 390
            });
            mySummerNote.summernote({focus: true});
            self.currentJobInfo.isShowSaveBtn = true;
            self.currentJobInfo.isShowEditBtn = false;
        }

        /**
         * 点击保存模态框中的内容
         * @private
         */
        function _modalSaveContent() {
            self.currentJobInfo.content = mySummerNote.summernote('code');
            mySummerNote.summernote('destroy');
            self.currentJobInfo.isShowSaveBtn = false;
            self.currentJobInfo.isShowEditBtn = true;
            self.currentJobInfo.enableSubmitBtn = true;
        }

        /**
         * 提交修改后的工作记录
         * @private
         */
        function _modalUpdateRecode() {
            //时间冲突检查
            if (_checkTimeConflicts()) {
                alert('所选时间内存在已提交的工作记录，请修改后提交！');
                return;
            }
            self.currentJobInfo.jobModule.starTime = self.currentJobInfo.selectedStartTime;
            self.currentJobInfo.jobModule.endTime = self.currentJobInfo.selectedEndTime;
            self.currentJobInfo.jobModule.type = self.currentJobInfo.selectedJobType;
            self.currentJobInfo.jobModule.projectID = self.currentJobInfo.selectedProject._id;
            self.currentJobInfo.jobModule.projectCName = self.currentJobInfo.selectedProject.cnName;
            self.currentJobInfo.jobModule.projectEName = self.currentJobInfo.selectedProject.enName;
            self.currentJobInfo.jobModule.content = self.currentJobInfo.content;
            self.currentJobInfo.jobModule.duration = (Math.abs(self.currentJobInfo.selectedEndTime - self.currentJobInfo.selectedStartTime) / (1000 * 60 * 60)).toFixed(1)
            MyJobsServices.recodeUpdate(self.currentJobInfo.jobModule, function (data) {
                self.currentJobInfo.jobModule.status = 'Submit';
                JobInfo.modal('hide');
                location.reload();
            }, function (data) {

            });
        }

        /**
         * 时间冲突检查
         * @returns {boolean}
         * @private
         */
        function _checkTimeConflicts() {

            var startTime = self.currentJobInfo.jobModule.starTime;
            var endTime = self.currentJobInfo.jobModule.endTime;

            var result = true;

            self.currentJobInfo.recodedJobs.forEach(function (item) {
                //若为Date类型--初始化添加
                if (angular.isDate(endTime) && angular.isDate(startTime)) {
                    if (endTime.getTime() > item.startTime.getTime() && startTime.getTime() < item.endTime.getTime()) {
                        result = result && false;
                    }
                }
                else {
                    //若为moment 修改后添加
                    if (endTime.isBefore(item.startTime) && startTime.isAfter(item.endTime)) {
                        result = result && false;
                    }
                }

            });

            return !result;
        }

    }

})();