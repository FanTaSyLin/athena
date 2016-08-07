/**
 * Created by FanTaSyLin on 2016/8/2.
 */
(function () {
    var app = angular.module('login-signin', []);
    app.controller('LogSignCtrl', ['$scope', 'AuthService', function ($scope, AuthService) {
        $scope.showLogin = true;

        $scope.credentials = {
            username : '',
            password : ''
        };

        $scope.switch = function (flg) {
            if (flg == 'signin') {
                $scope.showLogin = false;
            } else {
                $scope.showLogin = true;
            }
        };

        $scope.login = function () {

            AuthService.login($scope.credentials, loginSuccess, loginFailed);

            function loginSuccess(data, status, headers, config) {
                alert('Success');
                alert("data : " + data.user);
                alert("status : " + status);
                alert("headers : " + headers);
                alert("config : " + config);
            }

            function loginFailed(data, status, headers, config) {
                alert('Failed');
                alert("data : " + data);
                alert("status : " + status);
                alert("headers : " + headers);
                alert("config : " + config);
            }

        };

    }]);
})();