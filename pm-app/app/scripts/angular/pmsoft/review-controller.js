/**
 * Created by FanTaSyLin on 2016/9/29.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('ReviewController', ReviewController);

    ReviewController.$inject = ['PMSoftServices', '$cookies'];

    function ReviewController(PMSoftServices, $cookies) {

        var self = this;
        var difficultyEditor = angular.element(document.getElementById('difficulty'));
        var efficiencyEditor = angular.element(document.getElementById('efficiency'));
        var qualityEditor = angular.element(document.getElementById('quality'));
        var jobAudited = angular.element(document.getElementById('JobAudited'));

        self.currentJob = {};
        self.disableForwardBtn = true;
        self.disableBackwardBtn = false;

        self.init = init;
        self.goForwardJob = goForwardJob;
        self.goBackwardJob = goBackwardJob;
        self.ignoreThisJob = ignoreThisJob;
        self.checkThisJob = checkThisJob; /*审核当前工作记录*/

        function init() {
            self.currentJob = PMSoftServices.currentUnauditedJob;

        }

        function goForwardJob() {
            if (PMSoftServices.unauditedJobIndex < PMSoftServices.unauditedJobList.length - 1) {
                PMSoftServices.unauditedJobIndex++;
            } else {
                self.disableForwardBtn = false;
                self.disableBackwardBtn = true;
                return 'end';
            }
            var tmpItem = PMSoftServices.unauditedJobList[PMSoftServices.unauditedJobIndex];
            PMSoftServices.changeCurrentUnauditedJob(tmpItem);
        }

        function goBackwardJob() {
            if (PMSoftServices.unauditedJobIndex > 0) {
                PMSoftServices.unauditedJobIndex--;
            } else {
                self.disableForwardBtn = true;
                self.disableBackwardBtn = false;
            }
            var tmpItem = PMSoftServices.unauditedJobList[PMSoftServices.unauditedJobIndex];
            PMSoftServices.changeCurrentUnauditedJob(tmpItem);
        }

        function ignoreThisJob(id) {
            var ignoreUnauditedJobIDList = $cookies.get('ignoreUnauditedJobIDList');
            if (ignoreUnauditedJobIDList === undefined) {
                $cookies.put('ignoreUnauditedJobIDList', id);
            } else {
                ignoreUnauditedJobIDList = ignoreUnauditedJobIDList + ',' + id;
                $cookies.put('ignoreUnauditedJobIDList', ignoreUnauditedJobIDList);
            }
        }

        function checkThisJob(body) {
            body.reviewerID = $cookies.get('username');
            body.reviewerName = $cookies.get('name');
            body.reviewerAvatar = $cookies.get('avatar');
            body.difficulty = difficultyEditor.slider('getValue');
            body.efficiency = efficiencyEditor.slider('getValue');;
            body.quality = qualityEditor.slider('getValue');;
            PMSoftServices.recodeCheck(body, function (res) {
                if (goForwardJob()) {
                    jobAudited.modal('hide');
                }
            }, function (res) {

            });
        }

    }

})();