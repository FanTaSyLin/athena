/**
 * Created by FanTaSyLin on 2017/2/14.
 */


(function () {

    "use strict";

    angular.module("PMSoft")
        .controller("SharingController", SharingControllerFn);

    SharingControllerFn.$inject = ["$cookies", "PMSoftServices"];

    function SharingControllerFn($cookies, PMSoftServices) {

        var self = this;
        var sharingEditModal = angular.element(document.getElementById('sharingEdit'));
        var summernote = angular.element(document.getElementById('sharing-summernote'));
        var pastProjects = [];
        var operateType = "";

        sharingEditModal.on("show.bs.modal", dataInit);

        /**
         * @type {TargetItem}
         */
        self.currentTargetItem = {};

        /**
         * @type {TargetItem[]}
         */
        self.targetItems = [];

        self.sharingTitle = "";

        /**
         * 控制分享地址是否能够选择
         */
        self.allowSelectTarget = false;

        /**
         * 选择目的地址
         */
        self.selectTargetItem = _selectTargetItem;

        /**
         * 发布分享
         */
        self.submitSharing = _submitSharing;

        function _submitSharing() {
            var body = {};
            body.authorID = $cookies.get("account");
            body.authorName = $cookies.get("name");
            body.title = self.sharingTitle;
            body.content = summernote.summernote('code');
            body.attachments = [];
            body.tags = [];
            body.ranges = [{
                type: self.currentTargetItem.type,
                param: [self.currentTargetItem.id]
            }];

            if (operateType === "Create") {
                PMSoftServices.submitSharing(body, function (res) {
                    sharingEditModal.modal('hide');
                    if (PMSoftServices.onNewSharingSubmited !== undefined && typeof PMSoftServices.onNewSharingSubmited === "function") {
                        PMSoftServices.onNewSharingSubmited();
                    }
                }, function (res) {
                    alert("提交失败。请检查网络！");
                });
            } else if (operateType === "Edit") {
                body._id = PMSoftServices.currentSharingDetail._id;
                PMSoftServices.editSharing(body, function (res) {
                    sharingEditModal.modal('hide');
                    if (PMSoftServices.onSharingEdited !== undefined && typeof PMSoftServices.onSharingEdited === "function") {
                        PMSoftServices.onSharingEdited(body);
                    }
                }, function (res) {
                    alert("提交失败。请检查网络！");
                });
            }
        }

        function _selectTargetItem(item) {
            self.currentTargetItem = item;
        }

        function dataInit() {

            self.targetItems = [];

            var sysconfig = $cookies.getObject("Sysconfig");
            var departmentID = $cookies.get("department");
            var myDepartment = {};

            for (var i = 0; i < sysconfig[0].departments.length; i++) {
                if (sysconfig[0].departments[i].id.toString() === departmentID) {
                    myDepartment = sysconfig[0].departments[i].name;
                }
            }

            self.targetItems.push({
                id: departmentID,
                name: myDepartment,
                type: "department"
            });

            _getProjects(function (err, data) {
                data.forEach(function (item) {
                    self.targetItems.push({
                        id: item._id,
                        name: item.cnName,
                        type: "project"
                    });
                });
            });

            _initSummernote();

            if (PMSoftServices.currentSharingDetail) {
                self.currentTargetItem = PMSoftServices.currentSharingDetail.targetItem;
                self.allowSelectTarget = false;
                self.sharingTitle = PMSoftServices.currentSharingDetail.title;
                summernote.summernote("code", PMSoftServices.currentSharingDetail.content);
                operateType = "Edit";
            } else {
                self.currentTargetItem = self.targetItems[0];
                self.allowSelectTarget = true;
                self.sharingTitle = "";
                summernote.summernote("code", "");
                operateType = "Create";
            }

        }

        /**
         * 初始化Summernote
         */
        function _initSummernote() {
            summernote.summernote({
                minHeight: 700,
                maxHeight: 700,
                toolbar: [
                    // [groupName, [list of button]]
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['insert', ['picture', 'link', 'table', 'hr']]
                ]

            });
        }

        function _getProjects(cb) {

            pastProjects = [];

            /*获取项目列表*/
            PMSoftServices.getPastProjects($cookies.get('account'), function (data) {

                data.forEach(function (item) {
                    var project = {};
                    project.cnName = item.cnName;
                    project._id = item._id;
                    project.enName = item.enName;
                    pastProjects.push(project);
                });

                cb(null, pastProjects)

            }, function (data, status, headers, config) {
                cb(new Error(), null);
            });


        }


    }

    /**
     * @description 目标地址对象
     * @typedef {TargetItem} 
     * @property {string} id
     * @property {string} name
     * @property {string} type
     */

})();