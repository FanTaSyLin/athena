/**
 * Created by FanTaSyLin on 2016/9/5.
 */

(function () {

    angular.module('PMSoft')
        .controller('RecodeController', RecodeController);

    RecodeController.$inject = ['PMSoftServices', '$rootScope']

    function RecodeController(PMSoftServices, $rootScope) {

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

        self.dateSelect = dateSelect;
        self.getProjects = getProjects;
        self.projectSelect = projectSelect;
        self.sTimeSelect = sTimeSelect;
        self.eTimeSelect = eTimeSelect;
        self.typeSelect = typeSelect
        self.recodeSubmit = recodeSubmit;

        var recodeEditor = angular.element(document.getElementById('recode-editor'));

        init();

        function init() {

            /*获取日期列表*/
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

            }, function (data, status, headers, config) {

            });

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

            /*获取时间列表*/
            getTimeList();

        }

        function dateFormat(date) {
            var month = date.substring(5, 7);
            var day = date.substring(8, 10);
            return month + '月' + day + '日';
        }

        function timeFormat(time) {

            return ((time.getHours() < 10) ? '0' + time.getHours() : time.getHours())
                + ':' +
                ((time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes());

        }

        function dateSelect(date) {
            self.selectedDate = date;
        }

        function getProjects() {

            //self.projects = [];

            if (self.projects.length > 0) {
                return;
            }

            /*获取项目列表*/
            PMSoftServices.getPastProjects($rootScope.account, function (data) {

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

        function projectSelect(projectModule) {
            self.selectedProject = projectModule;
        }

        function getTimeList() {

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
            self.type = type;
        }

        function recodeSubmit() {

            self.markup = recodeEditor.summernote('code');

            //recodeEditor.summernote('destroy');

            if (!dataChecked()) {
                alert('1');
                //TODO: 检查表单是否必选项已填
            }

            var jobRecode = {
                authorID: $rootScope.account,
                authorName: $rootScope.username,
                authorAvatar: $rootScope.avatar,
                authorDepartment: $rootScope.department,
                type: self.selectedType,
                content: self.markup,
                projectID: self.selectedProject._id,
                projectCName: self.selectedProject.cnName,
                projectEName: self.selectedProject.enName,
                date: self.selectedDate.date.substring(0, 10),
                startTime: self.selectedDate.date.substring(0, 10) + ' ' + self.selectedStart.str,
                endTime: self.selectedDate.date.substring(0, 10) + ' ' + self.selectedEnd.str
            }

            PMSoftServices.recodeSubmit(jobRecode, function (data, status, headers, config) {

                //TODO: 清空表单
                clearForm();

            }, function (data, status, headers, config) {

            });

        }

        function dataChecked() {
            //项目必选
            if (self.selectedProject._id === '') return false;
            //起止时间必选
            if (self.selectedStart.str === '--:--') return false;
            if (self.selectedEnd.str === '--:--') return false;
            //工作内容必填
            if (self.markup === '') return false;

            return true;

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

    }

})();