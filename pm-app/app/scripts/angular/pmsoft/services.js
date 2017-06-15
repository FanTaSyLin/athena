/**
 * Created by FanTaSyLin on 2016/8/30.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .factory('PMSoftServices', Services);

    Services.$inject = ['$http']

    function Services($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';

        var self = {
            getEmployeeByName: _getEmployeeByName,
            getEmployeeByAccount: _getEmployeeByAccount,
            createProject: _createProject,
            getPastProjects: _getPastProjects,
            getDateList: _getDateList,
            recodeSubmit: _recodeSubmit,
            getJobList: _getJobList,
            getUnauditedJobs: _getUnauditedJobs,
            changeCurrentUnauditedJob: _changeCurrentUnauditedJob,
            cleanUnauditedJobList_Total: _cleanUnauditedJobList_Total, /*清空unauditedJobList_Total*/
            recodeCheck: _recodeCheck, /*审核工作记录*/
            recodeTurnBack: _recodeTurnBack, /*退回工作记录*/
            getProjectStaticByAccount: _getProjectStaticByAccount,
            getDepartmentMembers: _getDepartmentMembers,
            getSysConfig: _getSysConfig,
            changePwd: _changePwd,
            submitSharing: _submitSharing,
            /**
             * 获取分享列表
             */
            getSharings: _getSharings,
            /**
             * 获取单个分享的详细数据 （主要是content部分）
             */
            getSharingDetail: _getSharingDetail,

            /**
             * 提交编辑后的内容
             */
            editSharing: _editSharing,

            /**
             * 删除分享的内容
             */
            deleteSharing: _deleteSharing,

            /**
             * 设置分享置顶
             */
            setSharingPin: _setSharingPin,

            /**
             * 设置隐私模式
             */
            setSharingPrivacy: _setSharingPrivacy,

            /**
             * 获取员工在某段时间内的工作评价
             */
            getMemberJobEvaluation: _getMemberJobEvaluation,

            /**
             * 获取员工在某段时间的工作分配情况
             */
            getTimeDistribution: _getTimeDistribution,

            /**
             * 当提交了一个新的分享时触发此事件
             */
            onNewSharingSubmited: undefined,

            /**
             * 当对当前分享进行了修改后触发
             */
            onSharingEdited: undefined,

            /**
             * 参与过的项目列表
             */
            pastProjects: [],
            /**
             * 填写工作记录时所使用的日期列表
             */
            jobRecodeDateList: [],
            /**
             * 已提交工作记录列表
             */
            recodedJobLogList: [],
            /**
             * 当前待审核工作记录 为UnauditedsCtrl与 ReviewCtrl 传递参数
             */
            currentUnauditedJob: {},
            /**
             * 未审核工作列表-总体 为ReviewCtrl 传递参数
             */
            unauditedJobList_Total: [],
            /**
             * 未审核工作列表-筛选后保留 为ReviewCtrl 传递参数
             */
            unauditedJobList_Filter: [],
            /**
             * 未审核工作列表-分页后显示用 为ReviewCtrl 传递参数
             */
            unauditedJobList_View: [],
            /**
             * 一个计数器，用来标识currentUnauditedJob 在数组中的位置 每次数组更新 该下标重置为0
             */
            currentUnauditedJobIndex: 0,
            /**
             * 当前需要显示在modal中的分享内容详细信息
             */
            currentSharingDetail: undefined,
            /**
             * 用来传递 分享至 后面的地址列表
             */
            sharingTargets: [],
            /**
             * 用来传递 分享至 后面的地址
             */
            sharingTarget: {
                param: "",
                name: "",
                type: ""
            }
        }

        return self;

        function _getTimeDistribution(account, startDate, endDate, successFn, errorFn) {
            var url =  BASEPATH + "/static/member/" + account + "/time-distribution?start=" + startDate + "&end=" + endDate;
            $http.get(url).success(successFn).error(errorFn);
        }

        function _getMemberJobEvaluation(account, startDate, endDate, successFn, errorFn) {
            var url = BASEPATH + "/static/member/" + account + "/evaluation?start=" + startDate + "&end=" + endDate;
            $http.get(url).success(successFn).error(errorFn);
        }

        function _setSharingPrivacy(body, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/privacy", body).success(successFn).error(errorFn);
        }

        function _setSharingPin(body, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/pin", body).success(successFn).error(errorFn);
        }

        function _deleteSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/delete", data).success(successFn).error(errorFn);
        }

        function _editSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/edit", data).success(successFn).error(errorFn);
        }

        function _getSharingDetail(_id, successFn, errorFn) {
            $http.get(BASEPATH + "/sharing/detail?id=" + _id).success(successFn).error(errorFn);
        }

        function _getSharings(rangeType, departmentID, successFn, errorFn) {
            var paramStr = "";
            paramStr += "rangetype=" + rangeType;
            paramStr += "&param=" + departmentID.toString();
            $http.get(BASEPATH + "/sharing/list?" + paramStr).success(successFn).error(errorFn);
        }

        function _submitSharing(data, successFn, errorFn) {
            $http.post(BASEPATH + "/sharing/new", data).success(successFn).error(errorFn);
        }

        function _changePwd(account, orgPwd, newPwd, successFn, errorFn) {
            /*$http({
             url: 'http://123.56.135.196:4001/api/user/changepwd',
             method: 'POST',
             params: {
             username: account,
             orgpassword: orgPwd,
             newpassword: newPwd
             }
             }).success(successFn).error(errorFn);*/
            var body = {
                username: account,
                orgpassword: orgPwd,
                newpassword: newPwd
            }
            $http.post('http://123.56.135.196:4001/api/user/changepwd', body).success(successFn).error(errorFn);
        }

        function _getEmployeeByAccount(memberAccount, successFn, errorFn) {
            $http({
                url: BASEPATH + '/employee?account=' + memberAccount,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function _getEmployeeByName(memberName, successFn, errorFn) {
            var encodeStr = encodeURIComponent(memberName);
            $http({
                url: BASEPATH + '/employee?name=' + encodeStr,
                method: 'GET'
            }).success(successFn).error(errorFn);
            //$http.get(BASEPATH + '/employee/' + encodeStr).success(successFn).error(errorFn);
        }

        function _createProject(projectModule, successFn, errorFn) {
            $http.post(BASEPATH + '/project', projectModule).success(successFn).error(errorFn);
        }

        function _getPastProjects(account, successFn, errorFn) {
            if (account === 'all') {
                $http.get(BASEPATH + '/project/projectlist').success(successFn).error(errorFn);
            } else {
                $http.get(BASEPATH + '/project/projectlist/' + account).success(successFn).error(errorFn);
            }
        }

        function _getDateList(successFn, errorFn) {
            $http.get(BASEPATH + '/jobrecode/datelist').success(successFn).error(errorFn);
        }

        function _recodeSubmit(data, successFn, errorFn) {
            $http.post(BASEPATH + '/jobrecode/submit', data).success(successFn).error(errorFn);
        }

        function _getJobList(condition, successFn, errorFn) {
            var conditionStr = '';
            if (condition.username) {
                conditionStr += ('memberid=' + condition.username + '&');
            }
            if (condition.projectID) {
                conditionStr += ('projectid=' + condition.projectID + '&');
            }
            if (condition.startDate) {
                conditionStr += ('startdate=' + condition.startDate + '&');
            }
            if (condition.endDate) {
                conditionStr += ('enddate=' + condition.endDate + '&');
            }
            $http.get(BASEPATH + '/jobrecode/joblist?' + conditionStr).success(successFn).error(errorFn);
        }

        function _getUnauditedJobs(condition, successFn, errorFn) {
            var condition_Project = '';
            var condition_Member = '';
            if (condition.projectList) {
                condition_Project = 'projectid=';
                var _id = '';
                for (var i = 0; i < condition.projectList.length; i++) {
                    _id = condition.projectList[i]._id;
                    if (i === condition.projectList.length - 1) {
                        condition_Project += _id;
                    } else {
                        condition_Project += (_id + '%20');
                    }
                }
            }
            if (condition.memberID) {
                condition_Member = 'memberid=' + condition.memberID;
            }
            var conditionStr = condition_Project + '&' + condition_Member;

            $http.get(BASEPATH + '/jobrecode/unauditedlist?' + conditionStr).success(successFn).error(errorFn);
        }

        function _changeCurrentUnauditedJob(module) {
            for (var p in module) {
                self.currentUnauditedJob[p] = module[p];
            }
            if (self.unauditedJobList_Filter.length) {
                for (var i = 0; i < self.unauditedJobList_Filter.length; i++) {
                    if (self.unauditedJobList_Filter._id == module._id) {

                        self.currentUnauditedJobIndex = i;
                    }
                }
            }
        }

        /**
         *清空 unauditedJobList_Total 原有数据
         */
        function _cleanUnauditedJobList_Total() {
            self.unauditedJobList_Total.splice(0, self.unauditedJobList_Total.length);
            self.currentUnauditedJobIndex = 0;
        }

        function _recodeCheck(body, successFn, errorFn) {
            //为了减少传输数据的大小 body中除了有用的信息外其他信息需清除
            var item = {};
            for (var pro in body) {
                item[pro] = body[pro];
            }
            item.content = '';
            $http.post(BASEPATH + '/jobrecode/check', item).success(successFn).error(errorFn);
        }

        function _recodeTurnBack(body, successFn, errorFn) {
            //为了减少传输数据的大小 body中除了有用的信息外其他信息需清除
            var item = {};
            for (var pro in body) {
                item[pro] = body[pro];
            }
            item.content = '';
            $http.post(BASEPATH + '/jobrecode/turnback', item).success(successFn).error(errorFn);
        }

        /**
         * @description 获取该账户参加的所有项目的工作量统计结果 （包括：该项目的总工时，该账户在此项目中的总工时）
         * @param {string} account
         * @param {string[]} projectIDs
         * @param {Function} successFn
         * @param {Function} errorFn
         * @private
         */
        function _getProjectStaticByAccount(account, projectIDs, successFn, errorFn) {
            var projectIDsStr = " ";
            projectIDs.forEach(function (item) {
                projectIDsStr += item + " ";
            });
            var urlStr = BASEPATH + "/static/psoneral/realworkdone/" + account + "/" + projectIDsStr;
            $http.get(urlStr).success(successFn).error(errorFn);
        }

        /**
         * @description 根据部门编号获取部门成员信息
         * @param departmentNum 部门编号
         * @callback successFn
         * @callback errorFn
         * @private
         */
        function _getDepartmentMembers(departmentNum, successFn, errorFn) {
            var urlStr = BASEPATH + "/department/members?departmentnum=" + departmentNum;
            $http.get(urlStr).success(successFn).error(errorFn);
        }

        function _getSysConfig(successFn, errorFn) {
            var urlStr = BASEPATH + "/sysconfig";
            $http.get(urlStr).success(successFn).error(errorFn);
        }
    }

})();