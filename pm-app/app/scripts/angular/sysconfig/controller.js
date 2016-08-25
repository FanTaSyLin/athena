/**
 * Created by FanTaSyLin on 2016/8/20.
 */

(function () {
    
    'use strict';
    
    angular.module('SysConfig')
        .controller('SysConfigController', SysConfigCtrl);

    SysConfigCtrl.$inject = ['SysConfigService'];

    function SysConfigCtrl(SysConfigService) {
        var self = this;
        self.currentTab = 1;
        self.selectTab = selectTab;
        self.isSelectedTab = isSelectedTab;
        self.updateDptGroup = updateDptGroup;
        self.insertDptGroup = insertDptGroup;
        self.deleteDptGroup = deleteDptGroup;
        self.departmentGroups = [];
        self.newDepartmentGroup = {
            _id: 0,
            id: '',
            name: ''
        };

        self.departments = [];
        self.newDepartment = {
            id: '',
            name: '',
        };
        self.updateDepartment = updateDepartment;
        self.insertDepartment = insertDepartment;
        self.deleteDepartment = deleteDepartment;

        /* 部门 */
        function deleteDepartment(id) {

        }

        function insertDepartment(id, name) {

        }

        function updateDepartment(id, name) {

        }

        function onLoadDepartments(){
            self.newDepartment = {
                id: '',
                name: '',
            };

        }


        /* 部门分组 */
        function deleteDptGroup (id) {
            SysConfigService.deleteDepartmentGroup(id, function () {
                onLoadDepartmentGroups();
            }, function () {

            });
        }

        function insertDptGroup(id, name) {
            SysConfigService.insertDepartmentGroup({
                id: id,
                name: name
            }, function (data) {
                onLoadDepartmentGroups();
            }, function (data) {

            });
        }

        function updateDptGroup(_id, name) {
            SysConfigService.updateDepartmentGroup({
                _id: _id,
                name: name
            }, function (data) {
                onLoadDepartmentGroups();
            }, function (data) {

            })
        }

        function onLoadDepartmentGroups() {
            self.newDepartmentGroup = {
                _id: 0,
                id: '',
                name: ''
            };
            SysConfigService.getDepartmentGroups(function (data) {
                var list = [];
                for (var i = 0; i < data.length; i++) {
                    list.push({
                        _id: data[i]._id,
                        id: data[i].id,
                        name: data[i].name,
                        allowChange: true,
                        allowDelete: true
                    });
                }
                self.departmentGroups = list;
            }, function (res) {

            })
        }

        function isSelectedTab(tabNum) {
            return self.currentTab === tabNum;
        }

        function selectTab(tabNum) {
            self.currentTab = tabNum;

            if (tabNum === 1) {
                onLoadDepartmentGroups();
            } else if (tabNum === 2) {
                onLoadDepartments();
            }

        }
    }
    
})();