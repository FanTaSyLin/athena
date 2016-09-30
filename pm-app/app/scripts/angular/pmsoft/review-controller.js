/**
 * Created by FanTaSyLin on 2016/9/29.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('ReviewController', ReviewController);

    ReviewController.$inject = ['PMSoftServices']

    function ReviewController(PMSoftServices) {

        var self = this;

        self.currentJob = {};
        self.disableForwardBtn = true;
        self.disableBackwardBtn = false;


        self.init = init;
        self.goForwardJob = goForwardJob;
        self.goBackwardJob = goBackwardJob;

        function init() {
            self.currentJob = PMSoftServices.currentUnauditedJob;
        }


        function goForwardJob() {
            if (PMSoftServices.unauditedJobIndex < PMSoftServices.unauditedJobList.length - 1) {
                PMSoftServices.unauditedJobIndex++;
            } else {
                self.disableForwardBtn = false;
                self.disableBackwardBtn = true;
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

    }

})();