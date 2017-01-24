/**
 * Created by FanTaSyLin on 2016/9/5.
 */

(function () {

    angular.module('PMSoft')
        .controller('RecodeController', RecodeController);

    RecodeController.$inject = ['PMSoftServices', '$cookies']

    function RecodeController(PMSoftServices, $cookies) {

        var self = this;
        self.projects = [];
        self.dates = [];
        self.times = [];
        self.selectedDate = {};
        self.selectedProject = {};
        self.selectedStart = {};
        self.selectedEnd = {};
        self.selectedType = {};
        self.markup = '';
        /*已提交工作记录列表 用来比对时间是否重复*/
        self.recodedJobs = [];
        self.showSubmitBtn = false;

        self.dateSelect = dateSelect;
        self.projectSelect = projectSelect;
        self.sTimeSelect = sTimeSelect;
        self.eTimeSelect = eTimeSelect;
        self.typeSelect = typeSelect
        self.recodeSubmit = recodeSubmit;
        self.timeFormat = timeFormat;
        self.dateFormat = dateFormat;
        self.dateTimeFormat = dateTimeFormat;
        self.subStr = _subStr;

        var recodeEditor = angular.element(document.getElementById('recode-editor'));

        init();

        function init() {

            /*accountID = $cookies.get('account');*/
            /*accountName = $cookies.get('name');*/
            /*accountAvatar = $cookies.get('avatar');*/
            /*accountDepartment = $cookies.get('department');*/

            /*获取项目列表*/
            _getProjects();

            /*获取日期列表*/
            _getDateList(function () {

                /**
                 * 获取已提交工作记录列表
                 * 采用这种方式主要是为了保证在本机时间与系统时间不一致的情况下 不会出现获取的已提交日志日期不对的情况
                 * 因为还要用它来比较是否重复提交
                 */
                _getJobList({
                    username: $cookies.get('account'),
                    startDate: new Date(self.selectedDate.date.substring(0, 10)).toISOString().substring(0, 10),
                    endDate: new Date(self.selectedDate.date.substring(0, 10)).toISOString().substring(0, 10)
                }, function (err) {
                    if (err) {
                        return alert(err.message);
                    }
                    self.showSubmitBtn = true;
                });

            });

            /*获取时间列表*/
            _getTimeList();

            /*初始化界面信息*/
            self.selectedProject = {
                _id: '',
                cnName: '未选择',
                enName: '未选择'
            };

            self.selectedStart = {
                str: '--:--'
            };

            self.selectedEnd = {
                str: '--:--'
            };

            self.selectedType = '技术';

            recodeEditor.summernote({
                minHeight:200,
                maxHeight:390
            });
        }

        function dateFormat(date) {
            var month = date.substring(5, 7);
            var day = date.substring(8, 10);
            return month + '月' + day + '日';
        }

        function timeFormat(time) {

            if (time === null || time === undefined) return "";

            return moment(time).format("HH:mm");

        }

        function dateTimeFormat(dateTime) {
            if (dateTime !== null && dateTime !== undefined) {
                return moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
            }
        }

        function dateSelect(date) {
            self.selectedDate = date;
            self.showSubmitBtn = false;
            _getJobList({
                username: $cookies.get('account'),
                startDate: new Date(self.selectedDate.date.substring(0, 10)).toISOString().substring(0, 10),
                endDate: new Date(self.selectedDate.date.substring(0, 10)).toISOString().substring(0, 10)
            }, function (err) {
                if (err) {
                    return alert(err.message);
                }
                self.showSubmitBtn = true;
            });
        }

        function _getProjects() {

            self.projects = [];

            /*获取项目列表*/
            PMSoftServices.getPastProjects($cookies.get('account'), function (data) {

                data.forEach(function (item) {
                    var project = {};
                    project.cnName = item.cnName;
                    project._id = item._id;
                    project.enName = item.enName;
                    self.projects.push(project);
                });

            }, function (data, status, headers, config) {

            });
        }

        function _getDateList(cb) {
            self.dates = [];
            PMSoftServices.getDateList(function (data) {

                self.selectedDate = {
                    str: dateFormat(data[0]),
                    date: data[0]
                };

                data.forEach(function (item) {
                    self.dates.push({
                        str: dateFormat(item),
                        date: item
                    });
                });

                cb();

            }, function (data, status, headers, config) {

            });
        }

        function projectSelect(projectModule) {
            self.selectedProject = projectModule;
        }

        function _getTimeList() {

            var startDate = new Date('2016-01-01 07:00:00')
            for (var i = 0; i < 48; i++) {
                var time = new Date(startDate.getTime() + i * 0.5 * 60 * 60 * 1000);
                self.times.push({
                    str: timeFormat(time),
                    time: time
                });
            }

        }

        function sTimeSelect(time) {
            self.selectedStart = time;
        }

        function eTimeSelect(time) {
            self.selectedEnd = time;
        }

        function typeSelect(type) {
            self.selectedType = type;
        }

        function recodeSubmit() {

            self.markup = recodeEditor.summernote('code');

            //recodeEditor.summernote('destroy');

            if (!dataChecked()) {
                return;
            }


            var jobRecode = {
                authorID: $cookies.get('account'),
                authorName: $cookies.get('name'),
                authorAvatar: $cookies.get('avatar'),
                authorDepartment: $cookies.get('department'),
                type: self.selectedType,
                content: self.markup,
                projectID: self.selectedProject._id,
                projectCName: self.selectedProject.cnName,
                projectEName: self.selectedProject.enName,
                date: self.selectedDate.date.substring(0, 10),
                starTime: self.selectedDate.date.substring(0, 10) + ' ' + self.selectedStart.str,
                endTime: self.selectedDate.date.substring(0, 10) + ' ' + self.selectedEnd.str
            };

            //所选时间内是否有已提交工作记录
            if (checkTimeConflicts()) {
                alert('所选时间内存在已提交的工作记录，请修改后提交！');
                return;
            }

            PMSoftServices.recodeSubmit(jobRecode, function (data, status, headers, config) {

                //刷新已提交记录
                self.recodedJobs.push({
                    startTime: new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedStart.str),
                    endTime: new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedEnd.str),
                    cnName: self.selectedProject.cnName,
                    enName: self.selectedProject.enName,
                    reportTime: new Date()
                });

                //清空表单
                clearForm();

            }, function (data, status, headers, config) {

            });

        }

        function dataChecked() {
            //项目必选
            if (self.selectedProject._id === '') {
                alert('请选择所属项目');
                return false;
            }
            //起止时间必选
            if (self.selectedStart.str === '--:--') {
                alert('请选择开始时间');
                return false;
            }
            if (self.selectedEnd.str === '--:--') {
                alert('请选择结束时间');
                return false;
            }
            //工作内容必填
            if (self.markup === '') {
                alert('请填写工作内容');
                return false;
            }

            //开始时间 必须小于结束时间
            var startTime = new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedStart.str);
            var endTime = new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedEnd.str);
            if (moment(startTime) > moment(endTime)) {
                alert('时间选择错误');
                return false;
            }

            return true;

        }

        function checkTimeConflicts() {

            var startTime = new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedStart.str);
            var endTime = new Date(self.selectedDate.date.substring(0, 10) + ' ' + self.selectedEnd.str);

            var result = true;

            self.recodedJobs.forEach(function (item) {
                /*if (endTime.getTime() > item.starTime.getTime() && startTime.getTime() < item.endTime.getTime()) {
                    result = result && false;
                }*/
                if (moment(endTime) > moment(item.startTime) && moment(startTime) < moment(item.endTime)) {
                    result = result && false;
                }
            });

            return !result;
        }

        function clearForm() {
            self.selectedProject = {
                _id: '',
                cnName: '未选择',
                enName: '未选择'
            };

            self.selectedStart = {
                str: '--:--'
            };

            self.selectedEnd = {
                str: '--:--'
            };

            self.selectedType = '技术';

            recodeEditor.summernote('code', '');
        }

        function _getJobList(condition, cb) {

            PMSoftServices.getJobList(condition, function (data, status, headers, config) {

                var result = data.doc;

                self.recodedJobs = [];
                try {
                    result.forEach(function (item) {
                        self.recodedJobs.push({
                            startTime: moment(item.starTime),//new Date(new Date(item.starTime.substring(0, 10) + ' ' + item.starTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000),
                            endTime: moment(item.endTime),//new Date(new Date(item.endTime.substring(0, 10) + ' ' + item.endTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000),
                            cnName: item.projectCName,
                            enName: item.projectEName,
                            reportTime: moment(item.reportTime)//new Date(new Date(item.reportTime.substring(0, 10) + ' ' + item.reportTime.substring(11, 19)).getTime() + 8 * 60 * 60 * 1000)
                        });
                    });
                } catch (err) {
                    if (cb && typeof cb === 'function') {
                        return cb();
                    }
                }

                if (cb && typeof cb === 'function') {
                    return cb();
                }

            }, function (data, status, headers, config) {
                if (cb && typeof cb === 'function') {
                    return cb(new Error('获取工作记录失败'));
                }
            });
        }

        function _subStr(str, count) {
            return (str.length > count) ? str.substring(0, count) + '...' : str.substring(0, count);
        }

    }

})();