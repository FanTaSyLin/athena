/**
 * Created by FanTaSyLin on 2016/8/19.
 */
(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('CreateProjectCtrl', CreateProjectCtrl);

    function CreateProjectCtrl() {
        var self = this;
        self.tab = 1;
        self.members = [];
        self.selectTab = selectTab;
        self.isSelectedTab = isSelectedTab;
        self.back = stepBack;
        self.forward = stepForward;

        function stepForward() {
            if (self.tab < 3) {
                self.tab += 1;
            }
        }

        function stepBack() {
            if (self.tab > 1) {
                self.tab -= 1;
            }
        }

        function selectTab(setTab) {
            self.tab = setTab;
        }

        function isSelectedTab(checkTab) {
            return self.tab === checkTab;
        }
    }

})();