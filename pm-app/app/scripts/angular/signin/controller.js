/**
 * Created by FanTaSyLin on 2016/8/20.
 */

(function () {

    angular.module('SignIn')
        .controller('SignInController', SignInCtrl);

    SignInCtrl.$inject = ['SignInService'];

    function SignInCtrl(SignInService) {
        var self = this;
        self.account = 'fanl';
        self.departments = [];

        self.userInfo = {
            account: 'fanl',
            name: '',
            departmentId: '',
            mobile: '',
            officeTel: '',
            sex: 'male',
            authority: 0
        }

        self.getDepartments = getDepartments;
        self.getDepartmentName = getDepartmentName;
        self.selectedDepartment = selectedDepartment;
        self.selectedSex = selectedSex;
        self.getSexName = getSexName;
        self.signIn = signIn;

        function signIn(userInfo) {
            SignInService.userInfoSignIn(userInfo, function (data, status, header, config) {
                window.location.href = 'http://localhost:4002/pm-soft'
            }, function (data, status, header, config) {
                
            });
        }

        function getSexName(id) {
            if (id === 'male') {
                return '男';
            }

            if (id === 'female') {
                return '女';
            }
        }

        function selectedSex(id) {
            self.userInfo.sex = id;
        }

        function selectedDepartment(id) {
            self.userInfo.departmentId = id;
        }

        function getDepartmentName(id) {
            for (var i = 0; i < self.departments.length; i++) {
                if (self.departments[i].id === id) {
                    return self.departments[i].name
                }
            }
        }

        function getDepartments() {
            SignInService.getDepartments(function (data) {

                var list = [];
                for (var i = 0; i < data.length; i++) {
                    list.push({
                        _id: data[i]._id,
                        id: data[i].id,
                        name: data[i].name,
                        group: data[i].group,
                        allowChange: true,
                        allowDelete: true
                    });
                }
                self.departments = list;

            }, function () {

            });
        }

    }

})();