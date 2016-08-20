/**
 * Created by FanTaSyLin on 2016/8/20.
 */

(function () {
    
    'use strict';
    
    angular.module('SysConfig')
        .controller('SysConfigController', SysConfigCtrl);
    
    function SysConfigCtrl() {
        var self = this;
        self.currentTab = 1;
        self.selectTab = selectTab;
        self.isSelectedTab = isSelectedTab;
        self.updateDptGroup = updateDptGroup;

        self.departmentGroups = [
            {
                id: 1,
                name: '软件中心',
                allowChange: true,
                allowDelete: true
            },
            {
                id: 2,
                name: '项目管理中心',
                allowChange: true,
                allowDelete: true
            }
        ]

        function updateDptGroup(id, name) {

        }

        function isSelectedTab(tabNum) {
            return self.currentTab === tabNum;
        }

        function selectTab(tabNum) {
            self.currentTab = tabNum;
        }
    }
    
})();