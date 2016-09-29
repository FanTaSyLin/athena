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
        var recodeView = angular.element(document.getElementById('recode-view'));

        self.currentJob = {};

        self.init = init;

        function init() {
            self.currentJob = PMSoftServices.currentUnauditedJob;
            recodeView.summernote({
                minHeight:200,
                maxHeight:390
            });
        }

    }

})();