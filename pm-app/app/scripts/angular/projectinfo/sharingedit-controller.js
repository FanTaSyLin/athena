/**
 * Created by FanTaSyLin on 2017/2/14.
 */


(function () {

    "use strict";

    angular.module("ProjectInfo")
        .controller("SharingController", SharingControllerFn);

    SharingControllerFn.$inject = ["$cookies", "ProjectInfoServices"];

    function SharingControllerFn($cookies, ProjectInfoServices) {

        var self = this;
        var sharingEditModal = angular.element(document.getElementById('sharingEdit'));
        var summernote = angular.element(document.getElementById('sharing-summernote'));
        var pastProjects = [];
        var operateType = "";

        sharingEditModal.on("show.bs.modal", dataInit);

        /**
         * @type {TargetItem}
         */
        self.currentTargetItem = ProjectInfoServices.sharingTarget;

        /**
         * @type {TargetItem[]}
         */
        self.targetItems = ProjectInfoServices.sharingTargets;

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
                param: [self.currentTargetItem.param]
            }];

            if (operateType === "Create") {
                ProjectInfoServices.submitSharing(body, function (res) {
                    sharingEditModal.modal('hide');
                    if (ProjectInfoServices.onNewSharingSubmited !== undefined && typeof ProjectInfoServices.onNewSharingSubmited === "function") {
                        ProjectInfoServices.onNewSharingSubmited();
                    }
                }, function (res) {
                    alert("提交失败。请检查网络！");
                });
            } else if (operateType === "Edit") {
                body._id = ProjectInfoServices.currentSharingDetail._id;
                ProjectInfoServices.editSharing(body, function (res) {
                    sharingEditModal.modal('hide');
                    if (ProjectInfoServices.onSharingEdited !== undefined && typeof ProjectInfoServices.onSharingEdited === "function") {
                        ProjectInfoServices.onSharingEdited(body);
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
            
            _initSummernote();

            if (ProjectInfoServices.currentSharingDetail) {
                self.currentTargetItem = ProjectInfoServices.currentSharingDetail.targetItem;
                self.allowSelectTarget = false;
                self.sharingTitle = ProjectInfoServices.currentSharingDetail.title;
                summernote.summernote("code", ProjectInfoServices.currentSharingDetail.content);
                operateType = "Edit";
            } else {
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


    }

    /**
     * @description 目标地址对象
     * @typedef {TargetItem} 
     * @property {any} param
     * @property {string} name
     * @property {string} type
     */

})();