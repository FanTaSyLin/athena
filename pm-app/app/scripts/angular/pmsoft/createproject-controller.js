/**
 * Created by FanTaSyLin on 2016/8/19.
 */
(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('CreateProjectCtrl', CreateProjectCtrl);

    CreateProjectCtrl.$inject = ['PMSoftServices', '$cookies'];

    function CreateProjectCtrl(PMSoftServices, $cookies) {
        var self = this;
        var accountID = '';
        var accountName = '';
        var accountAvatar = '';

        self.tab = 1;
        self.members = [];
        self.newMemberName = '';
        self.selectTab = selectTab;
        self.isSelectedTab = isSelectedTab;
        self.back = stepBack;
        self.forward = stepForward;
        self.selectedPType = selectedPType;
        self.addNewMember = addNewMember;
        self.rmMember = rmMember;
        self.selectedMemberPermission = selectedMemberPermission;
        self.getPermissionName = getPermissionName;
        self.createProject = createProject;

        self.projectModule = {
            cnName: '',
            enName: '',
            authorID: '',
            authorName: '',
            authorAvatar: '',
            type: '',
            about: '',
            members: [],
            reviewers: []
        };

        init();

        function init() {

            accountID = $cookies.get('account');
            accountName = $cookies.get('name');
            accountAvatar = $cookies.get('avatar');
            self.projectModule.authorID = accountID;
            self.projectModule.authorName = accountName;
            self.projectModule.authorAvatar = accountAvatar;

            //项目创建者自动成为项目组成员
            self.projectModule.members.push({
                account: self.projectModule.authorID,
                name: self.projectModule.authorName,
                avatar: self.projectModule.authorAvatar,
                permission: '1',
                showInMembers: false
            });

            //项目创建者自动具有审批权限
            self.projectModule.reviewers.push({
                account: self.projectModule.authorID,
                name: self.projectModule.authorName,
                avatar: self.projectModule.authorAvatar
            });

        }

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

        function selectedPType(type) {
            self.projectModule.type = type;
        }

        function addNewMember($event, memberName) {
            if ($event.keyCode === 13) {

                PMSoftServices.getEmployeeByName(memberName, function (data, status, headers, config) {

                    data.forEach(function (item) {

                        //阻止创建人添加到成员列表
                        if (item.account == self.projectModule.authorID) {
                            return;
                        }

                        //阻止重复添加
                        if (findElem(self.members, 'account', item.account) != -1) {
                            return;
                        }

                        var member = {
                            account: item.account,
                            name: item.name,
                            avatar: item.avatar,
                            permission: '0',
                            showInMembers: true
                        }
                        self.projectModule.members.push(member);
                    });
                }, function (data, status, headers, config) {

                })
            }
        }

        function rmMember(memberAccount) {
            var index = findElem(self.projectModule.members, 'account', memberAccount);
            if (index != -1) {
                self.projectModule.members.splice(index, 1);
            }
        }

        function selectedMemberPermission(item, permission) {
            item.permission = permission;
            if (permission === '1') {
                self.projectModule.reviewers.push({
                    account: item.account,
                    name: item.name,
                    avatar: item.avatar
                });
            } else {
                var index = findElem(self.projectModule.reviewers, 'account', item.account);
                self.projectModule.reviewers.splice(0, index + 1);
            }
        }

        function getPermissionName(num) {
            if (num === "1") {
                return '审核';
            } else {
                return '普通'
            }
        }

        function createProject(module) {

            self.projectModule.authorID = accountID;
            self.projectModule.authorName = accountName;
            self.projectModule.authorAvatar = accountAvatar;

            PMSoftServices.createProject(module, function (data, status, headers, config) {
                selectTab(4);

            }, function (data, status, headers, config) {
                //alert("error");
            });
        }
    }

    function findElem(array, prop, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][prop] == value) {
                return i;
            }
        }

        return -1;
    }

})();