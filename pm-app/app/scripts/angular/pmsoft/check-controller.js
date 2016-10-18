/**
 * Created by FanTaSyLin on 2016/9/29.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('JobCheckController', JobCheckController);

    JobCheckController.$inject = ['PMSoftServices', '$cookies'];

    function JobCheckController(PMSoftServices, $cookies) {

        var self = this;
        var accountID = '';
        var accountName = '';
        var accountAvatar = '';
        var difficultyEditor = angular.element(document.getElementById('difficulty'));
        var efficiencyEditor = angular.element(document.getElementById('efficiency'));
        var qualityEditor = angular.element(document.getElementById('quality'));
        var jobAudited = angular.element(document.getElementById('JobAudited'));

        self.currentJob = {};
        self.disableForwardBtn = true;
        self.disableBackwardBtn = false;

        self.init = _init;
        self.goForwardJob = _goForwardJob;
        self.goBackwardJob = _goBackwardJob;
        self.ignoreThisJob = _ignoreThisJob;
        self.checkThisJob = _checkThisJob;/*审核当前工作记录*/
        self.turnBackJob = _turnBackJob;/*退回已提交的工作记录*/
        self.disMissModal = _disMissModal;/*取消审核模态框*/
        self.formatDateTime = _formatDateTime;/*格式化日期时间*/

        function _init() {
            self.currentJob = PMSoftServices.currentUnauditedJob;
            accountID = $cookies.get('account');;
            accountName = $cookies.get('name');
            accountAvatar = $cookies.get('avatar');
        }

        function _goForwardJob() {
            PMSoftServices.currentUnauditedJobIndex++;
            if (PMSoftServices.currentUnauditedJobIndex < PMSoftServices.unauditedJobList_Filter.length) {
                var tmpItem = PMSoftServices.unauditedJobList_Filter[PMSoftServices.currentUnauditedJobIndex];
                if (tmpItem.status === 'Pass' || tmpItem.status === 'TurnBack') {
                    goForwardJob();
                } else {
                    PMSoftServices.changeCurrentUnauditedJob(tmpItem);
                }
            } else {
                PMSoftServices.currentUnauditedJobIndex = PMSoftServices.unauditedJobList_Filter.length -1;
                return;
            }
        }

        function _goBackwardJob() {
            PMSoftServices.currentUnauditedJobIndex--;
            if (PMSoftServices.currentUnauditedJobIndex > -1) {
                var tmpItem = PMSoftServices.unauditedJobList_Filter[PMSoftServices.currentUnauditedJobIndex];
                if (tmpItem.status === 'Pass' || tmpItem.status === 'TurnBack') {
                    goBackwardJob();
                } else {
                    PMSoftServices.changeCurrentUnauditedJob(tmpItem);
                }
            } else {
                PMSoftServices.currentUnauditedJobIndex = 0;
                return;
            }
        }

        function _ignoreThisJob(id) {
            var ignoreUnauditedJobIDList = $cookies.get('ignoreUnauditedJobIDList');
            if (ignoreUnauditedJobIDList === undefined) {
                $cookies.put('ignoreUnauditedJobIDList', id);
            } else {
                ignoreUnauditedJobIDList = ignoreUnauditedJobIDList + ',' + id;
                $cookies.put('ignoreUnauditedJobIDList', ignoreUnauditedJobIDList);
            }
        }

        function _checkThisJob(body) {
            body.reviewerID = accountID;
            body.reviewerName = accountName;
            body.reviewerAvatar = accountAvatar;
            body.difficulty = difficultyEditor.slider('getValue');
            body.efficiency = efficiencyEditor.slider('getValue');
            body.quality = qualityEditor.slider('getValue');
            PMSoftServices.recodeCheck(body, function (res) {

                var item = PMSoftServices.unauditedJobList_Filter[PMSoftServices.currentUnauditedJobIndex];
                item.status = 'Pass';

                //显示下一条记录
                if (_goForwardJob()) {
                    jobAudited.modal('hide');
                    location.reload();
                }
            }, function (res) {

            });
        }
        
        function _turnBackJob(reasonStr, body) {
            body.turnBackReason = reasonStr;
            body.reviewerID = accountID;
            body.reviewerName = accountName;
            PMSoftServices.recodeTurnBack(body, function (res) {
                var item = PMSoftServices.unauditedJobList_Filter[PMSoftServices.currentUnauditedJobIndex];
                item.status = 'TurnBack';
                //显示下一条记录
                if (_goForwardJob()) {
                    jobAudited.modal('hide');
                    location.reload();
                }
            }, function (res) {

            });
        }

        function _disMissModal() {
            location.reload();
        }

        function _formatDateTime(DateTime) {
            return new Date(DateTime).toLocaleDateString() + ' ' + new Date(DateTime).toLocaleTimeString();
        }

    }

})();